package com.beta.shoes.controller;

import com.beta.shoes.dto.DashboardDto;
import com.beta.shoes.dto.OrderDto;
import com.beta.shoes.service.DashboardService;
import com.beta.shoes.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final DashboardService dashboardService;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardDto.AdminSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderDto.OrderResponse>> getOrders(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(orderService.getAdminOrders(status, search, PageRequest.of(page, size)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto.OrderResponse> updateOrderStatus(
        @PathVariable UUID id,
        @Valid @RequestBody OrderDto.OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }
}
