package com.beta.shoes.controller;

import com.beta.shoes.dto.SchoolDto;
import com.beta.shoes.service.SchoolService;
import com.beta.shoes.service.StudentOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/schools")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSchoolController {

    private final SchoolService schoolService;
    private final StudentOrderService studentOrderService;

    @PostMapping
    public ResponseEntity<SchoolDto.SchoolResponse> createSchool(@Valid @RequestBody SchoolDto.SchoolRequest request) {
        return ResponseEntity.ok(schoolService.createSchool(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolDto.SchoolResponse> updateSchool(
        @PathVariable UUID id,
        @Valid @RequestBody SchoolDto.SchoolRequest request
    ) {
        return ResponseEntity.ok(schoolService.updateSchool(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolDto.SchoolResponse> getSchool(@PathVariable UUID id) {
        return ResponseEntity.ok(schoolService.getSchool(id));
    }

    /**
     * Dedicated School Dashboard Summary Cards:
     * Live dynamic counts for shoes, shirts, pants, shorts, T-shirts, socks, bags
     */
    @GetMapping("/{id}/summary")
    public ResponseEntity<SchoolDto.SchoolSummaryResponse> getSchoolSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(schoolService.getSchoolSummary(id));
    }

    @GetMapping
    public ResponseEntity<Page<SchoolDto.SchoolResponse>> searchSchools(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean isActive,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(schoolService.searchSchools(search, isActive, pageRequest));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateSchool(@PathVariable UUID id) {
        schoolService.deactivateSchool(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateSchool(@PathVariable UUID id) {
        schoolService.activateSchool(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * CSV Export of School Orders and student product requirements
     */
    @GetMapping("/{id}/reports/csv")
    public ResponseEntity<String> exportOrdersCsv(@PathVariable UUID id) {
        String csv = studentOrderService.generateSchoolOrdersCsv(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"school-orders-" + id + ".csv\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csv);
    }
}
