package com.beta.shoes.service;

import com.beta.shoes.dto.StudentDto;
import com.beta.shoes.dto.StudentOrderDto;
import com.beta.shoes.entity.*;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentOrderService {

    private final StudentOrderRepository studentOrderRepository;
    private final StudentOrderItemRepository studentOrderItemRepository;
    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;
    private final StudentService studentService;

    @Transactional
    public StudentOrderDto.StudentOrderResponse createOrder(StudentOrderDto.CreateStudentOrderRequest request, UUID adminUserId) {
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + request.getSchoolId()));

        Student student;
        if (request.getStudentId() != null) {
            student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));
        } else if (request.getNewStudent() != null) {
            request.getNewStudent().setSchoolId(school.getId());
            StudentDto.StudentResponse createdStudent = studentService.createStudent(request.getNewStudent());
            student = studentRepository.findById(createdStudent.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student creation failed"));
        } else {
            throw new BadRequestException("Either an existing studentId or newStudent details must be provided.");
        }

        User adminUser = null;
        if (adminUserId != null) {
            adminUser = userRepository.findById(adminUserId).orElse(null);
        }

        String orderNumber = request.getOrderNumber();
        if (orderNumber == null || orderNumber.trim().isEmpty()) {
            orderNumber = generateOrderNumber(school.getCode());
        } else {
            orderNumber = orderNumber.trim().toUpperCase();
            if (studentOrderRepository.findByOrderNumber(orderNumber).isPresent()) {
                throw new BadRequestException("Order number " + orderNumber + " already exists.");
            }
        }

        SchoolOrderStatus status = request.getStatus() != null ? request.getStatus() : SchoolOrderStatus.DRAFT;
        SchoolOrderStockPolicy stockPolicy = request.getStockPolicy() != null ? request.getStockPolicy() : SchoolOrderStockPolicy.BOOKING_ONLY;

        StudentOrder order = StudentOrder.builder()
            .school(school)
            .student(student)
            .orderNumber(orderNumber)
            .orderType("SCHOOL_VISIT")
            .status(status)
            .stockPolicy(stockPolicy)
            .createdByAdmin(adminUser)
            .notes(request.getNotes())
            .visitDate(request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now())
            .build();

        // Add items
        for (StudentOrderDto.OrderItemRequest itemReq : request.getItems()) {
            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findById(itemReq.getProductId()).orElse(null);
            }

            ProductSize productSize = null;
            if (itemReq.getProductSizeId() != null) {
                productSize = productSizeRepository.findById(itemReq.getProductSizeId()).orElse(null);
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            if (unitPrice.compareTo(BigDecimal.ZERO) == 0 && product != null) {
                unitPrice = product.getBasePrice();
            }

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            StudentOrderItem item = StudentOrderItem.builder()
                .product(product)
                .productSize(productSize)
                .category(itemReq.getCategory())
                .productName(itemReq.getProductName().trim())
                .sizeLabel(itemReq.getSizeLabel().trim())
                .quantity(itemReq.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .itemNotes(itemReq.getItemNotes())
                .stockReserved(false)
                .build();

            order.addItem(item);
        }

        // Apply configurable stock reservation policy if confirmed
        if (stockPolicy == SchoolOrderStockPolicy.RESERVE_STOCK && status == SchoolOrderStatus.CONFIRMED) {
            reserveStockForOrder(order, adminUserId);
        }

        StudentOrder saved = studentOrderRepository.save(order);
        log.info("Recorded school visit order: id={}, orderNumber={}, school={}, items={}",
            saved.getId(), saved.getOrderNumber(), school.getCode(), saved.getItems().size());

        return mapToResponse(saved);
    }

    @Transactional
    public StudentOrderDto.StudentOrderResponse updateOrder(UUID orderId, StudentOrderDto.CreateStudentOrderRequest request, UUID adminUserId) {
        StudentOrder order = studentOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("School order not found: " + orderId));

        if (order.getStatus() == SchoolOrderStatus.FULFILLED || order.getStatus() == SchoolOrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot edit order with status " + order.getStatus());
        }

        // If stock was previously reserved, release it first before re-evaluating
        releaseStockForOrder(order, adminUserId);

        if (request.getStudentId() != null && !request.getStudentId().equals(order.getStudent().getId())) {
            Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));
            order.setStudent(student);
        }

        order.setNotes(request.getNotes());
        if (request.getVisitDate() != null) {
            order.setVisitDate(request.getVisitDate());
        }
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        if (request.getStockPolicy() != null) {
            order.setStockPolicy(request.getStockPolicy());
        }

        // Clear existing items and repopulate
        order.getItems().clear();
        for (StudentOrderDto.OrderItemRequest itemReq : request.getItems()) {
            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findById(itemReq.getProductId()).orElse(null);
            }

            ProductSize productSize = null;
            if (itemReq.getProductSizeId() != null) {
                productSize = productSizeRepository.findById(itemReq.getProductSizeId()).orElse(null);
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            if (unitPrice.compareTo(BigDecimal.ZERO) == 0 && product != null) {
                unitPrice = product.getBasePrice();
            }

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            StudentOrderItem item = StudentOrderItem.builder()
                .product(product)
                .productSize(productSize)
                .category(itemReq.getCategory())
                .productName(itemReq.getProductName().trim())
                .sizeLabel(itemReq.getSizeLabel().trim())
                .quantity(itemReq.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .itemNotes(itemReq.getItemNotes())
                .stockReserved(false)
                .build();

            order.addItem(item);
        }

        // Apply reservation policy if confirmed
        if (order.getStockPolicy() == SchoolOrderStockPolicy.RESERVE_STOCK && order.getStatus() == SchoolOrderStatus.CONFIRMED) {
            reserveStockForOrder(order, adminUserId);
        }

        StudentOrder saved = studentOrderRepository.save(order);
        log.info("Updated school visit order: id={}, orderNumber={}", saved.getId(), saved.getOrderNumber());
        return mapToResponse(saved);
    }

    @Transactional
    public StudentOrderDto.StudentOrderResponse updateOrderStatus(UUID orderId, StudentOrderDto.UpdateOrderStatusRequest request, UUID adminUserId) {
        StudentOrder order = studentOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("School order not found: " + orderId));

        SchoolOrderStatus oldStatus = order.getStatus();
        SchoolOrderStatus newStatus = request.getStatus();

        if (request.getStockPolicy() != null) {
            order.setStockPolicy(request.getStockPolicy());
        }
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        // Status transition handling
        if (newStatus == SchoolOrderStatus.CANCELLED) {
            releaseStockForOrder(order, adminUserId);
        } else if (newStatus == SchoolOrderStatus.CONFIRMED && oldStatus != SchoolOrderStatus.CONFIRMED) {
            if (order.getStockPolicy() == SchoolOrderStockPolicy.RESERVE_STOCK) {
                reserveStockForOrder(order, adminUserId);
            }
        }

        order.setStatus(newStatus);
        StudentOrder saved = studentOrderRepository.save(order);
        log.info("Order {} status changed from {} to {}", order.getOrderNumber(), oldStatus, newStatus);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public StudentOrderDto.StudentOrderResponse getOrder(UUID orderId) {
        StudentOrder order = studentOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("School order not found: " + orderId));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<StudentOrderDto.StudentOrderResponse> searchOrders(UUID schoolId, String search, SchoolOrderStatus status, Pageable pageable) {
        return studentOrderRepository.searchOrders(schoolId, search, status, pageable)
            .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<StudentOrderDto.StudentOrderResponse> getStudentOrders(UUID studentId) {
        return studentOrderRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public StudentOrderDto.BulkImportOrdersResponse bulkImportOrders(StudentOrderDto.BulkImportOrdersRequest request, UUID adminUserId) {
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + request.getSchoolId()));

        User adminUser = null;
        if (adminUserId != null) {
            adminUser = userRepository.findById(adminUserId).orElse(null);
        }

        // Preload school products for price/product lookup by name
        List<Product> allProducts = productRepository.findAll();

        // Group rows by student key (admissionNumber if present, else studentName + class + section)
        Map<String, List<StudentOrderDto.BulkImportRowDto>> studentGroups = new LinkedHashMap<>();
        int rowIndex = 0;
        for (StudentOrderDto.BulkImportRowDto row : request.getRows()) {
            rowIndex++;
            String adm = row.getAdmissionNumber() != null ? row.getAdmissionNumber().trim() : "";
            String name = row.getStudentName() != null ? row.getStudentName().trim() : "";
            String cls = row.getGradeClass() != null ? row.getGradeClass().trim() : "";
            String sec = row.getSection() != null ? row.getSection().trim() : "";
            String prodName = row.getProductName() != null ? row.getProductName().trim() : "";

            if (name.isEmpty() && adm.isEmpty()) {
                continue; // skip blank rows
            }
            if (prodName.isEmpty()) {
                continue;
            }

            String key = !adm.isEmpty()
                ? "ADM:" + adm.toUpperCase()
                : "NAME:" + name.toLowerCase() + "|" + cls.toLowerCase() + "|" + sec.toLowerCase() + "|" + rowIndex;
            // Note: if admissionNumber is empty, group same student name + class + section together!
            if (adm.isEmpty()) {
                key = "NAME:" + name.toLowerCase() + "|" + cls.toLowerCase() + "|" + sec.toLowerCase();
            }
            studentGroups.computeIfAbsent(key, k -> new ArrayList<>()).add(row);
        }

        if (studentGroups.isEmpty()) {
            throw new BadRequestException("No valid student order rows found in the imported data.");
        }

        int studentsProcessed = 0;
        int newStudentsCreated = 0;
        int ordersCreated = 0;
        int totalItemsImported = 0;
        List<StudentOrderDto.StudentOrderResponse> createdOrders = new ArrayList<>();

        SchoolOrderStatus status = request.getStatus() != null ? request.getStatus() : SchoolOrderStatus.CONFIRMED;
        SchoolOrderStockPolicy stockPolicy = request.getStockPolicy() != null ? request.getStockPolicy() : SchoolOrderStockPolicy.BOOKING_ONLY;
        LocalDate visitDate = request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now();

        long currentCount = studentRepository.countBySchoolId(school.getId());

        for (Map.Entry<String, List<StudentOrderDto.BulkImportRowDto>> entry : studentGroups.entrySet()) {
            List<StudentOrderDto.BulkImportRowDto> rows = entry.getValue();
            StudentOrderDto.BulkImportRowDto first = rows.get(0);

            String adm = first.getAdmissionNumber() != null ? first.getAdmissionNumber().trim().toUpperCase() : "";
            String fullName = first.getStudentName() != null ? first.getStudentName().trim() : "Student";
            String gradeClass = first.getGradeClass() != null && !first.getGradeClass().trim().isEmpty()
                ? first.getGradeClass().trim() : "1";
            String section = first.getSection() != null && !first.getSection().trim().isEmpty()
                ? first.getSection().trim().toUpperCase() : "A";
            String parentPhone = first.getParentPhone() != null ? first.getParentPhone().trim() : null;
            String parentName = first.getParentName() != null ? first.getParentName().trim() : null;
            String gender = first.getGender() != null ? first.getGender().trim() : null;

            Student student = null;
            if (!adm.isEmpty()) {
                student = studentRepository.findBySchoolIdAndAdmissionNumber(school.getId(), adm).orElse(null);
            }

            if (student == null) {
                if (adm.isEmpty()) {
                    currentCount++;
                    adm = "ADM-" + (1000 + currentCount) + "-" + UUID.randomUUID().toString().substring(0, 3).toUpperCase();
                }
                String[] parts = fullName.split("\\s+", 2);
                String firstName = parts[0];
                String lastName = parts.length > 1 ? parts[1] : ".";

                student = Student.builder()
                    .school(school)
                    .admissionNumber(adm)
                    .firstName(firstName)
                    .lastName(lastName)
                    .gradeClass(gradeClass)
                    .section(section)
                    .parentName(parentName)
                    .parentPhone(parentPhone)
                    .gender(gender)
                    .isActive(true)
                    .build();
                student = studentRepository.save(student);
                newStudentsCreated++;
            }
            studentsProcessed++;

            StudentOrder order = StudentOrder.builder()
                .school(school)
                .student(student)
                .orderNumber(generateOrderNumber(school.getCode()))
                .orderType("SCHOOL_VISIT")
                .status(status)
                .stockPolicy(stockPolicy)
                .createdByAdmin(adminUser)
                .notes(first.getNotes() != null && !first.getNotes().trim().isEmpty() ? first.getNotes().trim() : "Imported via Excel/CSV")
                .visitDate(visitDate)
                .build();

            for (StudentOrderDto.BulkImportRowDto itemRow : rows) {
                String pName = itemRow.getProductName() != null ? itemRow.getProductName().trim() : "School Product";
                String sizeLabel = itemRow.getSizeLabel() != null && !itemRow.getSizeLabel().trim().isEmpty()
                    ? itemRow.getSizeLabel().trim() : "Free";
                int qty = itemRow.getQuantity() != null && itemRow.getQuantity() > 0 ? itemRow.getQuantity() : 1;

                // Match product by name if available
                Product matchedProduct = allProducts.stream()
                    .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(pName))
                    .findFirst()
                    .orElse(null);

                ProductSize matchedSize = null;
                if (matchedProduct != null && matchedProduct.getSizes() != null) {
                    matchedSize = matchedProduct.getSizes().stream()
                        .filter(sz -> sz.getUkSize() != null && sz.getUkSize().equalsIgnoreCase(sizeLabel))
                        .findFirst()
                        .orElse(null);
                }

                SchoolProductCategory cat = parseSchoolCategory(
                    itemRow.getCategory() != null && !itemRow.getCategory().trim().isEmpty()
                        ? itemRow.getCategory()
                        : (matchedProduct != null ? matchedProduct.getCategory() : "SHOES")
                );

                BigDecimal unitPrice = itemRow.getUnitPrice() != null ? itemRow.getUnitPrice() : BigDecimal.ZERO;
                if (unitPrice.compareTo(BigDecimal.ZERO) <= 0 && matchedProduct != null && matchedProduct.getBasePrice() != null) {
                    unitPrice = matchedProduct.getBasePrice();
                }

                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(qty));

                StudentOrderItem item = StudentOrderItem.builder()
                    .product(matchedProduct)
                    .productSize(matchedSize)
                    .category(cat)
                    .productName(pName)
                    .sizeLabel(sizeLabel)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .itemNotes(itemRow.getNotes())
                    .stockReserved(false)
                    .build();

                order.addItem(item);
                totalItemsImported++;
            }

            if (stockPolicy == SchoolOrderStockPolicy.RESERVE_STOCK && status == SchoolOrderStatus.CONFIRMED) {
                reserveStockForOrder(order, adminUserId);
            }

            StudentOrder savedOrder = studentOrderRepository.save(order);
            ordersCreated++;
            createdOrders.add(mapToResponse(savedOrder));
        }

        log.info("Bulk imported school orders for school {}: students={}, newStudents={}, orders={}, items={}",
            school.getCode(), studentsProcessed, newStudentsCreated, ordersCreated, totalItemsImported);

        return StudentOrderDto.BulkImportOrdersResponse.builder()
            .studentsProcessed(studentsProcessed)
            .newStudentsCreated(newStudentsCreated)
            .ordersCreated(ordersCreated)
            .totalItemsImported(totalItemsImported)
            .orders(createdOrders)
            .build();
    }

    private SchoolProductCategory parseSchoolCategory(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return SchoolProductCategory.SHOES;
        }
        String u = raw.trim().toUpperCase().replace("-", "").replace("_", "").replace(" ", "");
        if (u.contains("TSHIRT") || u.contains("TEE")) return SchoolProductCategory.TSHIRTS;
        if (u.contains("SHIRT")) return SchoolProductCategory.SHIRTS;
        if (u.contains("PANT") || u.contains("TROUSER")) return SchoolProductCategory.PANTS;
        if (u.contains("SHORT") || u.contains("SKIRT")) return SchoolProductCategory.SHORTS;
        if (u.contains("SOCK")) return SchoolProductCategory.SOCKS;
        if (u.contains("BAG") || u.contains("BACKPACK")) return SchoolProductCategory.BAGS;
        return SchoolProductCategory.SHOES;
    }

    /**
     * Generates CSV report of school orders and student product requirements
     */
    @Transactional(readOnly = true)
    public String generateSchoolOrdersCsv(UUID schoolId) {
        School school = schoolRepository.findById(schoolId)
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + schoolId));

        List<StudentOrder> orders = studentOrderRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);

        StringBuilder sb = new StringBuilder();
        sb.append("Order Number,Admission ID,Student Name,Class,Section,Parent Phone,Category,Product Name,Size,Quantity,Unit Price (INR),Subtotal (INR),Status,Stock Policy,Visit Date,Notes\n");

        for (StudentOrder order : orders) {
            Student s = order.getStudent();
            String studentName = escapeCsv(s.getFirstName() + " " + s.getLastName());
            String phone = escapeCsv(s.getParentPhone() != null ? s.getParentPhone() : "");
            String section = escapeCsv(s.getSection() != null ? s.getSection() : "");

            for (StudentOrderItem item : order.getItems()) {
                sb.append(escapeCsv(order.getOrderNumber())).append(",")
                  .append(escapeCsv(s.getAdmissionNumber())).append(",")
                  .append(studentName).append(",")
                  .append(escapeCsv(s.getGradeClass())).append(",")
                  .append(section).append(",")
                  .append(phone).append(",")
                  .append(escapeCsv(item.getCategory().name())).append(",")
                  .append(escapeCsv(item.getProductName())).append(",")
                  .append(escapeCsv(item.getSizeLabel())).append(",")
                  .append(item.getQuantity()).append(",")
                  .append(item.getUnitPrice()).append(",")
                  .append(item.getSubtotal()).append(",")
                  .append(order.getStatus().name()).append(",")
                  .append(order.getStockPolicy().name()).append(",")
                  .append(order.getVisitDate()).append(",")
                  .append(escapeCsv(item.getItemNotes() != null ? item.getItemNotes() : "")).append("\n");
            }
        }

        return sb.toString();
    }

    private void reserveStockForOrder(StudentOrder order, UUID adminUserId) {
        for (StudentOrderItem item : order.getItems()) {
            if (item.getProductSize() != null && !item.isStockReserved()) {
                Inventory inv = inventoryRepository.findWithLockByProductSizeId(item.getProductSize().getId())
                    .orElse(null);

                if (inv != null) {
                    int available = inv.getTotalStock() - inv.getReservedStock();
                    if (available < item.getQuantity()) {
                        throw new BadRequestException("Insufficient inventory to reserve for " + item.getProductName() +
                            " (Size " + item.getSizeLabel() + "): requested " + item.getQuantity() + ", available " + available);
                    }
                    inv.setReservedStock(inv.getReservedStock() + item.getQuantity());
                    inventoryRepository.save(inv);
                    item.setStockReserved(true);

                    // Audit stock movement
                    StockMovement movement = StockMovement.builder()
                        .productSize(item.getProductSize())
                        .movementType("SCHOOL_RESERVATION")
                        .quantity(item.getQuantity())
                        .adminUserId(adminUserId)
                        .notes("School order reservation for " + order.getOrderNumber() + " (" + order.getSchool().getName() + ")")
                        .build();
                    stockMovementRepository.save(movement);
                }
            }
        }
    }

    private void releaseStockForOrder(StudentOrder order, UUID adminUserId) {
        for (StudentOrderItem item : order.getItems()) {
            if (item.getProductSize() != null && item.isStockReserved()) {
                Inventory inv = inventoryRepository.findWithLockByProductSizeId(item.getProductSize().getId())
                    .orElse(null);

                if (inv != null) {
                    int newReserved = Math.max(0, inv.getReservedStock() - item.getQuantity());
                    inv.setReservedStock(newReserved);
                    inventoryRepository.save(inv);
                    item.setStockReserved(false);

                    StockMovement movement = StockMovement.builder()
                        .productSize(item.getProductSize())
                        .movementType("SCHOOL_RESERVATION_RELEASE")
                        .quantity(item.getQuantity())
                        .adminUserId(adminUserId)
                        .notes("School reservation released for " + order.getOrderNumber())
                        .build();
                    stockMovementRepository.save(movement);
                }
            }
        }
    }

    private String generateOrderNumber(String schoolCode) {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "VISIT-" + schoolCode + "-" + datePart + "-" + randomPart;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private StudentOrderDto.StudentOrderResponse mapToResponse(StudentOrder order) {
        Student s = order.getStudent();
        String studentName = s.getFirstName() + " " + s.getLastName();
        String createdByName = order.getCreatedByAdmin() != null
            ? order.getCreatedByAdmin().getFirstName() + " " + order.getCreatedByAdmin().getLastName()
            : "Admin";

        List<StudentOrderDto.StudentOrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> StudentOrderDto.StudentOrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productSizeId(item.getProductSize() != null ? item.getProductSize().getId() : null)
                .category(item.getCategory())
                .productName(item.getProductName())
                .sizeLabel(item.getSizeLabel())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .itemNotes(item.getItemNotes())
                .stockReserved(item.isStockReserved())
                .build())
            .toList();

        return StudentOrderDto.StudentOrderResponse.builder()
            .id(order.getId())
            .schoolId(order.getSchool().getId())
            .schoolName(order.getSchool().getName())
            .studentId(s.getId())
            .studentName(studentName)
            .admissionNumber(s.getAdmissionNumber())
            .gradeClass(s.getGradeClass())
            .section(s.getSection())
            .parentContact(s.getParentPhone())
            .orderNumber(order.getOrderNumber())
            .orderType(order.getOrderType())
            .status(order.getStatus())
            .stockPolicy(order.getStockPolicy())
            .totalQuantity(order.getTotalQuantity())
            .estimatedTotalAmount(order.getEstimatedTotalAmount())
            .notes(order.getNotes())
            .visitDate(order.getVisitDate())
            .createdByName(createdByName)
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .items(itemResponses)
            .build();
    }
}
