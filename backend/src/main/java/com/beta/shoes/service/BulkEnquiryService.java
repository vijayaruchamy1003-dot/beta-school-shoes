package com.beta.shoes.service;

import com.beta.shoes.dto.BulkEnquiryDto;
import com.beta.shoes.entity.BulkEnquiry;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.BulkEnquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkEnquiryService {

    private final BulkEnquiryRepository bulkEnquiryRepository;

    @Transactional
    public BulkEnquiryDto.Response submitEnquiry(BulkEnquiryDto.CreateRequest request) {
        BulkEnquiry enquiry = BulkEnquiry.builder()
            .schoolName(request.getSchoolName().trim())
            .contactPerson(request.getContactPerson().trim())
            .phone(request.getPhone().trim())
            .email(request.getEmail().trim().toLowerCase())
            .cityState(request.getCityState().trim())
            .estimatedStudents(request.getEstimatedStudents())
            .shoeModelsRequested(request.getShoeModelsRequested())
            .notes(request.getNotes())
            .status("NEW")
            .build();

        enquiry = bulkEnquiryRepository.save(enquiry);
        log.info("New bulk enquiry submitted for school: {} by {}", enquiry.getSchoolName(), enquiry.getContactPerson());

        return mapToResponse(enquiry);
    }

    @Transactional(readOnly = true)
    public Page<BulkEnquiryDto.Response> getEnquiries(String status, String search, Pageable pageable) {
        String cleanStatus = StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status) ? status.trim().toUpperCase() : null;
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;

        return bulkEnquiryRepository.findEnquiries(cleanStatus, cleanSearch, pageable)
            .map(this::mapToResponse);
    }

    @Transactional
    public BulkEnquiryDto.Response updateStatus(UUID id, BulkEnquiryDto.StatusUpdateRequest request) {
        BulkEnquiry enquiry = bulkEnquiryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bulk enquiry not found: " + id));

        enquiry.setStatus(request.getStatus().trim().toUpperCase());
        if (request.getAdminNotes() != null) {
            enquiry.setAdminNotes(request.getAdminNotes());
        }

        enquiry = bulkEnquiryRepository.save(enquiry);
        return mapToResponse(enquiry);
    }

    private BulkEnquiryDto.Response mapToResponse(BulkEnquiry e) {
        return BulkEnquiryDto.Response.builder()
            .id(e.getId())
            .schoolName(e.getSchoolName())
            .contactPerson(e.getContactPerson())
            .phone(e.getPhone())
            .email(e.getEmail())
            .cityState(e.getCityState())
            .estimatedStudents(e.getEstimatedStudents())
            .shoeModelsRequested(e.getShoeModelsRequested())
            .notes(e.getNotes())
            .status(e.getStatus())
            .adminNotes(e.getAdminNotes())
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .build();
    }
}
