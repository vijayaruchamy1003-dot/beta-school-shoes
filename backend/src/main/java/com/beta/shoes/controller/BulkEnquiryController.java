package com.beta.shoes.controller;

import com.beta.shoes.dto.BulkEnquiryDto;
import com.beta.shoes.service.BulkEnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/bulk-enquiries")
@RequiredArgsConstructor
public class BulkEnquiryController {

    private final BulkEnquiryService bulkEnquiryService;

    // Public submission from schools and uniform committees
    @PostMapping
    public ResponseEntity<BulkEnquiryDto.Response> submitEnquiry(@Valid @RequestBody BulkEnquiryDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bulkEnquiryService.submitEnquiry(request));
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BulkEnquiryDto.Response>> getEnquiries(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(bulkEnquiryService.getEnquiries(status, search, PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BulkEnquiryDto.Response> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody BulkEnquiryDto.StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(bulkEnquiryService.updateStatus(id, request));
    }
}
