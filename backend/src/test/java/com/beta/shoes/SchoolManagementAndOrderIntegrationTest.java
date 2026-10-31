package com.beta.shoes;

import com.beta.shoes.dto.SchoolDto;
import com.beta.shoes.dto.StudentDto;
import com.beta.shoes.dto.StudentOrderDto;
import com.beta.shoes.entity.SchoolOrderStatus;
import com.beta.shoes.entity.SchoolOrderStockPolicy;
import com.beta.shoes.entity.SchoolProductCategory;
import com.beta.shoes.service.SchoolService;
import com.beta.shoes.service.StudentOrderService;
import com.beta.shoes.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class SchoolManagementAndOrderIntegrationTest {

    @Autowired
    private SchoolService schoolService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentOrderService studentOrderService;

    @Test
    @DisplayName("Should create school, register students, record school-visit order without payment, and compute live category totals")
    void testSchoolManagementAndVisitOrderWorkflow() {
        // 1. Create School
        String schoolCode = "TEST-SCH-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        SchoolDto.SchoolResponse school = schoolService.createSchool(SchoolDto.SchoolRequest.builder()
            .name("Springfield Model High School")
            .code(schoolCode)
            .address("742 Evergreen Terrace, Sector 5")
            .contactPerson("Seymour Skinner")
            .phone("+91 98450 99887")
            .email("principal@springfield.edu.in")
            .isActive(true)
            .build());

        assertNotNull(school.getId());
        assertEquals(schoolCode, school.getCode());

        // 2. Register Students with Class/Section
        StudentDto.StudentResponse student1 = studentService.createStudent(StudentDto.StudentRequest.builder()
            .schoolId(school.getId())
            .admissionNumber("SP-001")
            .firstName("Bart")
            .lastName("Simpson")
            .gradeClass("Grade 4")
            .section("A")
            .parentName("Homer Simpson")
            .parentPhone("+91 98450 11223")
            .gender("MALE")
            .build());

        StudentDto.StudentResponse student2 = studentService.createStudent(StudentDto.StudentRequest.builder()
            .schoolId(school.getId())
            .admissionNumber("SP-002")
            .firstName("Lisa")
            .lastName("Simpson")
            .gradeClass("Grade 2")
            .section("B")
            .parentName("Marge Simpson")
            .parentPhone("+91 98450 44556")
            .gender("FEMALE")
            .build());

        assertNotNull(student1.getId());
        assertNotNull(student2.getId());

        // 3. Record School Visit Order for Student 1 across multiple product categories
        // NO payment details, NO Razorpay ID required!
        StudentOrderDto.StudentOrderResponse order1 = studentOrderService.createOrder(
            StudentOrderDto.CreateStudentOrderRequest.builder()
                .schoolId(school.getId())
                .studentId(student1.getId())
                .status(SchoolOrderStatus.CONFIRMED)
                .stockPolicy(SchoolOrderStockPolicy.BOOKING_ONLY)
                .notes("School campus fitment drive")
                .visitDate(LocalDate.now())
                .items(List.of(
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.SHOES)
                        .productName("BETA Classic Oxford Lace-Up")
                        .sizeLabel("UK 3")
                        .quantity(2)
                        .unitPrice(BigDecimal.valueOf(749.00))
                        .build(),
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.SHIRTS)
                        .productName("White Uniform Shirt")
                        .sizeLabel("Size 30")
                        .quantity(3)
                        .unitPrice(BigDecimal.valueOf(450.00))
                        .build(),
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.PANTS)
                        .productName("Navy Formal Trousers")
                        .sizeLabel("Size 28")
                        .quantity(2)
                        .unitPrice(BigDecimal.valueOf(650.00))
                        .build(),
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.SOCKS)
                        .productName("Navy Knee Socks")
                        .sizeLabel("Medium")
                        .quantity(4)
                        .unitPrice(BigDecimal.valueOf(199.00))
                        .build()
                ))
                .build(),
            null
        );

        assertNotNull(order1.getId());
        assertEquals("SCHOOL_VISIT", order1.getOrderType());
        assertEquals(SchoolOrderStatus.CONFIRMED, order1.getStatus());
        assertEquals(SchoolOrderStockPolicy.BOOKING_ONLY, order1.getStockPolicy());
        assertEquals(11, order1.getTotalQuantity()); // 2 + 3 + 2 + 4 = 11 items

        // 4. Record School Visit Order for Student 2 with SHORTS, TSHIRTS, BAGS
        StudentOrderDto.StudentOrderResponse order2 = studentOrderService.createOrder(
            StudentOrderDto.CreateStudentOrderRequest.builder()
                .schoolId(school.getId())
                .studentId(student2.getId())
                .status(SchoolOrderStatus.CONFIRMED)
                .stockPolicy(SchoolOrderStockPolicy.BOOKING_ONLY)
                .visitDate(LocalDate.now())
                .items(List.of(
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.SHORTS)
                        .productName("White PT Shorts")
                        .sizeLabel("Size 24")
                        .quantity(2)
                        .unitPrice(BigDecimal.valueOf(400.00))
                        .build(),
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.TSHIRTS)
                        .productName("Sports House T-Shirt")
                        .sizeLabel("Size 28")
                        .quantity(1)
                        .unitPrice(BigDecimal.valueOf(450.00))
                        .build(),
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.BAGS)
                        .productName("Institutional School Bag")
                        .sizeLabel("Standard 24L")
                        .quantity(1)
                        .unitPrice(BigDecimal.valueOf(650.00))
                        .build(),
                    StudentOrderDto.OrderItemRequest.builder()
                        .category(SchoolProductCategory.SHOES)
                        .productName("BETA Mary Jane Single-Strap")
                        .sizeLabel("UK 1")
                        .quantity(1)
                        .unitPrice(BigDecimal.valueOf(749.00))
                        .build()
                ))
                .build(),
            null
        );

        assertNotNull(order2.getId());
        assertEquals(5, order2.getTotalQuantity()); // 2 + 1 + 1 + 1 = 5 items

        // 5. Test Live Dynamic Category Calculation in School Dashboard
        SchoolDto.SchoolSummaryResponse summary = schoolService.getSchoolSummary(school.getId());
        assertNotNull(summary);
        assertEquals(school.getId(), summary.getSchoolId());
        assertEquals(2, summary.getTotalStudents());
        assertEquals(2, summary.getTotalOrders());
        assertEquals(16, summary.getTotalItemsBooked()); // 11 + 5 = 16

        // Check required category totals:
        // Shoes: 2 from order 1 + 1 from order 2 = 3
        assertEquals(3, summary.getShoesCount());
        // Shirts: 3 from order 1 = 3
        assertEquals(3, summary.getShirtsCount());
        // Pants: 2 from order 1 = 2
        assertEquals(2, summary.getPantsCount());
        // Shorts: 2 from order 2 = 2
        assertEquals(2, summary.getShortsCount());
        // T-Shirts: 1 from order 2 = 1
        assertEquals(1, summary.getTshirtsCount());
        // Socks: 4 from order 1 = 4
        assertEquals(4, summary.getSocksCount());
        // Bags: 1 from order 2 = 1
        assertEquals(1, summary.getBagsCount());

        // 6. Test CSV Export Generation
        String csv = studentOrderService.generateSchoolOrdersCsv(school.getId());
        assertNotNull(csv);
        assertTrue(csv.contains("Order Number,Admission ID,Student Name"));
        assertTrue(csv.contains("Bart Simpson"));
        assertTrue(csv.contains("Lisa Simpson"));
        assertTrue(csv.contains("SHOES"));
        assertTrue(csv.contains("SHIRTS"));
        assertTrue(csv.contains("BAGS"));
    }
}
