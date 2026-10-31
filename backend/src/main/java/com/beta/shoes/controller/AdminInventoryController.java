package com.beta.shoes.controller;

import com.beta.shoes.dto.DashboardDto;
import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.security.UserDetailsImpl;
import com.beta.shoes.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inventory")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/adjust")
    public ResponseEntity<ProductDto.AdminSizeStockResponse> adjustStock(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @Valid @RequestBody ProductDto.StockAdjustmentRequest request
    ) {
        return ResponseEntity.ok(inventoryService.adjustStock(userPrincipal.getId(), request));
    }

    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<ProductDto.AdminSizeStockResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }

    @GetMapping("/movements")
    public ResponseEntity<Page<DashboardDto.StockMovementResponse>> getStockMovements(
        @RequestParam(required = false) UUID productSizeId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(inventoryService.getStockMovements(productSizeId, PageRequest.of(page, size)));
    }
}
