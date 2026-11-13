package com.beta.shoes.controller;

import com.beta.shoes.dto.StudentDto;
import com.beta.shoes.dto.StudentOrderDto;
import com.beta.shoes.service.StudentOrderService;
import com.beta.shoes.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
@RequiredArgsConstructor
public class AdminStudentController {

    private final StudentService studentService;
    private final StudentOrderService studentOrderService;

    @PostMapping
    public ResponseEntity<StudentDto.StudentResponse> createStudent(@Valid @RequestBody StudentDto.StudentRequest request) {
        return ResponseEntity.ok(studentService.createStudent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDto.StudentResponse> updateStudent(
        @PathVariable UUID id,
        @Valid @RequestBody StudentDto.StudentRequest request
    ) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto.StudentResponse> getStudent(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.getStudent(id));
    }

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<Page<StudentDto.StudentResponse>> searchStudents(
        @PathVariable UUID schoolId,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String gradeClass,
        @RequestParam(required = false) String section,
        @RequestParam(required = false) Boolean isActive,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("gradeClass").ascending().and(Sort.by("firstName").ascending()));
        return ResponseEntity.ok(studentService.searchStudents(schoolId, search, gradeClass, section, isActive, pageRequest));
    }

    @GetMapping("/school/{schoolId}/classes")
    public ResponseEntity<List<String>> getSchoolClasses(@PathVariable UUID schoolId) {
        return ResponseEntity.ok(studentService.getSchoolClasses(schoolId));
    }

    @GetMapping("/school/{schoolId}/sections")
    public ResponseEntity<List<String>> getSchoolSections(@PathVariable UUID schoolId) {
        return ResponseEntity.ok(studentService.getSchoolSections(schoolId));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<StudentOrderDto.StudentOrderResponse>> getStudentOrders(@PathVariable UUID id) {
        return ResponseEntity.ok(studentOrderService.getStudentOrders(id));
    }
}
