package com.beta.shoes.controller;

import com.beta.shoes.dto.StudentOrderDto;
import com.beta.shoes.entity.SchoolOrderStatus;
import com.beta.shoes.security.UserDetailsImpl;
import com.beta.shoes.service.StudentOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/school-orders")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
@RequiredArgsConstructor
public class AdminSchoolOrderController {

    private final StudentOrderService studentOrderService;

    /**
     * School-visit order recording:
     * NO PAYMENT REQUIRED, no Razorpay transaction created or checked.
     * Pure institutional order recording.
     */
    @PostMapping
    public ResponseEntity<StudentOrderDto.StudentOrderResponse> createOrder(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @Valid @RequestBody StudentOrderDto.CreateStudentOrderRequest request
    ) {
        UUID adminId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(studentOrderService.createOrder(request, adminId));
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<StudentOrderDto.BulkImportOrdersResponse> bulkImportOrders(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @Valid @RequestBody StudentOrderDto.BulkImportOrdersRequest request
    ) {
        UUID adminId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(studentOrderService.bulkImportOrders(request, adminId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentOrderDto.StudentOrderResponse> updateOrder(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @PathVariable UUID id,
        @Valid @RequestBody StudentOrderDto.CreateStudentOrderRequest request
    ) {
        UUID adminId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(studentOrderService.updateOrder(id, request, adminId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StudentOrderDto.StudentOrderResponse> updateOrderStatus(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @PathVariable UUID id,
        @Valid @RequestBody StudentOrderDto.UpdateOrderStatusRequest request
    ) {
        UUID adminId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(studentOrderService.updateOrderStatus(id, request, adminId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentOrderDto.StudentOrderResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(studentOrderService.getOrder(id));
    }

    @GetMapping
    public ResponseEntity<Page<StudentOrderDto.StudentOrderResponse>> getAllOrders(
        @RequestParam(required = false) UUID schoolId,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) SchoolOrderStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(studentOrderService.searchOrders(schoolId, search, status, pageRequest));
    }

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<Page<StudentOrderDto.StudentOrderResponse>> searchOrders(
        @PathVariable UUID schoolId,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) SchoolOrderStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(studentOrderService.searchOrders(schoolId, search, status, pageRequest));
    }
}
