package com.beta.shoes.service;

import com.beta.shoes.dto.SchoolDto;
import com.beta.shoes.entity.School;
import com.beta.shoes.entity.SchoolOrderStatus;
import com.beta.shoes.entity.SchoolProductCategory;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.SchoolRepository;
import com.beta.shoes.repository.StudentOrderItemRepository;
import com.beta.shoes.repository.StudentOrderRepository;
import com.beta.shoes.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final StudentOrderRepository studentOrderRepository;
    private final StudentOrderItemRepository studentOrderItemRepository;

    @Transactional
    public SchoolDto.SchoolResponse createSchool(SchoolDto.SchoolRequest request) {
        if (schoolRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("School with code " + request.getCode() + " already exists.");
        }

        School school = School.builder()
            .name(request.getName().trim())
            .code(request.getCode().trim().toUpperCase())
            .address(request.getAddress().trim())
            .contactPerson(request.getContactPerson().trim())
            .phone(request.getPhone().trim())
            .email(request.getEmail().trim().toLowerCase())
            .isActive(request.getIsActive() != null ? request.getIsActive() : true)
            .build();

        School saved = schoolRepository.save(school);
        log.info("Created school: id={}, code={}", saved.getId(), saved.getCode());
        return mapToResponse(saved);
    }

    @Transactional
    public SchoolDto.SchoolResponse updateSchool(UUID id, SchoolDto.SchoolRequest request) {
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + id));

        String upperCode = request.getCode().trim().toUpperCase();
        if (schoolRepository.existsByCodeAndIdNot(upperCode, id)) {
            throw new BadRequestException("School with code " + upperCode + " already exists.");
        }

        school.setName(request.getName().trim());
        school.setCode(upperCode);
        school.setAddress(request.getAddress().trim());
        school.setContactPerson(request.getContactPerson().trim());
        school.setPhone(request.getPhone().trim());
        school.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getIsActive() != null) {
            school.setActive(request.getIsActive());
        }

        School updated = schoolRepository.save(school);
        log.info("Updated school: id={}, code={}", updated.getId(), updated.getCode());
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public SchoolDto.SchoolResponse getSchool(UUID id) {
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + id));
        return mapToResponse(school);
    }

    @Transactional(readOnly = true)
    public Page<SchoolDto.SchoolResponse> searchSchools(String search, Boolean isActive, Pageable pageable) {
        return schoolRepository.searchSchools(search, isActive, pageable)
            .map(this::mapToResponse);
    }

    @Transactional
    public void deactivateSchool(UUID id) {
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + id));
        school.setActive(false);
        schoolRepository.save(school);
        log.info("Deactivated school: {}", id);
    }

    @Transactional
    public void activateSchool(UUID id) {
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + id));
        school.setActive(true);
        schoolRepository.save(school);
        log.info("Activated school: {}", id);
    }

    /**
     * Calculates live summary card totals for:
     * shoes, shirts, pants, shorts, T-shirts, socks and bags
     * Dynamically aggregated from student order items; never hardcoded.
     */
    @Transactional(readOnly = true)
    public SchoolDto.SchoolSummaryResponse getSchoolSummary(UUID schoolId) {
        School school = schoolRepository.findById(schoolId)
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + schoolId));

        long totalStudents = studentRepository.countBySchoolId(schoolId);
        long totalOrders = studentOrderRepository.countBySchoolIdAndStatusNot(schoolId, SchoolOrderStatus.CANCELLED);

        // Fetch category quantities excluding cancelled orders
        List<Object[]> categoryCounts = studentOrderItemRepository.getCategoryQuantitiesBySchool(schoolId, SchoolOrderStatus.CANCELLED);
        Map<SchoolProductCategory, Integer> countMap = new HashMap<>();
        for (Object[] row : categoryCounts) {
            SchoolProductCategory cat = (SchoolProductCategory) row[0];
            Number qty = (Number) row[1];
            countMap.put(cat, qty != null ? qty.intValue() : 0);
        }

        int shoes = countMap.getOrDefault(SchoolProductCategory.SHOES, 0);
        int shirts = countMap.getOrDefault(SchoolProductCategory.SHIRTS, 0);
        int pants = countMap.getOrDefault(SchoolProductCategory.PANTS, 0);
        int shorts = countMap.getOrDefault(SchoolProductCategory.SHORTS, 0);
        int tshirts = countMap.getOrDefault(SchoolProductCategory.TSHIRTS, 0);
        int socks = countMap.getOrDefault(SchoolProductCategory.SOCKS, 0);
        int bags = countMap.getOrDefault(SchoolProductCategory.BAGS, 0);

        int totalItemsBooked = shoes + shirts + pants + shorts + tshirts + socks + bags;

        // Fetch category and size breakdown
        List<Object[]> sizeRows = studentOrderItemRepository.getCategorySizeQuantitiesBySchool(schoolId, SchoolOrderStatus.CANCELLED);
        List<SchoolDto.CategorySizeSummary> sizeBreakdown = new ArrayList<>();
        for (Object[] row : sizeRows) {
            SchoolProductCategory cat = (SchoolProductCategory) row[0];
            String size = (String) row[1];
            Number qty = (Number) row[2];
            sizeBreakdown.add(SchoolDto.CategorySizeSummary.builder()
                .category(cat)
                .sizeLabel(size)
                .quantity(qty != null ? qty.intValue() : 0)
                .build());
        }

        return SchoolDto.SchoolSummaryResponse.builder()
            .schoolId(school.getId())
            .schoolName(school.getName())
            .schoolCode(school.getCode())
            .totalStudents(totalStudents)
            .totalOrders(totalOrders)
            .totalItemsBooked(totalItemsBooked)
            .shoesCount(shoes)
            .shirtsCount(shirts)
            .pantsCount(pants)
            .shortsCount(shorts)
            .tshirtsCount(tshirts)
            .socksCount(socks)
            .bagsCount(bags)
            .categorySizeBreakdown(sizeBreakdown)
            .build();
    }

    private SchoolDto.SchoolResponse mapToResponse(School school) {
        long studentCount = studentRepository.countBySchoolId(school.getId());
        long orderCount = studentOrderRepository.countBySchoolId(school.getId());

        return SchoolDto.SchoolResponse.builder()
            .id(school.getId())
            .name(school.getName())
            .code(school.getCode())
            .address(school.getAddress())
            .contactPerson(school.getContactPerson())
            .phone(school.getPhone())
            .email(school.getEmail())
            .isActive(school.isActive())
            .totalStudents(studentCount)
            .totalOrders(orderCount)
            .createdAt(school.getCreatedAt())
            .updatedAt(school.getUpdatedAt())
            .build();
    }
}
