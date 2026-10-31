package com.beta.shoes.service;

import com.beta.shoes.dto.DashboardDto;
import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.entity.Inventory;
import com.beta.shoes.entity.ProductSize;
import com.beta.shoes.entity.StockMovement;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.InventoryRepository;
import com.beta.shoes.repository.ProductSizeRepository;
import com.beta.shoes.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductSizeRepository productSizeRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public ProductDto.AdminSizeStockResponse adjustStock(UUID adminUserId, ProductDto.StockAdjustmentRequest request) {
        ProductSize productSize = productSizeRepository.findById(request.getProductSizeId())
            .orElseThrow(() -> new ResourceNotFoundException("Product size not found: " + request.getProductSizeId()));

        // Concurrency-safe row-level lock
        Inventory inventory = inventoryRepository.findWithLockByProductSizeId(request.getProductSizeId())
            .orElseGet(() -> {
                Inventory inv = Inventory.builder()
                    .productSize(productSize)
                    .totalStock(0)
                    .reservedStock(0)
                    .lowStockThreshold(5)
                    .build();
                return inventoryRepository.save(inv);
            });

        int newTotal = inventory.getTotalStock() + request.getQuantityChange();
        if (newTotal < inventory.getReservedStock()) {
            throw new BadRequestException("Cannot reduce stock below currently reserved stock (" + inventory.getReservedStock() + ").");
        }
        if (newTotal < 0) {
            throw new BadRequestException("Total stock cannot be negative.");
        }

        inventory.setTotalStock(newTotal);
        inventory = inventoryRepository.save(inventory);

        // Record stock movement audit log
        StockMovement movement = StockMovement.builder()
            .productSize(productSize)
            .movementType(request.getMovementType().toUpperCase())
            .quantity(request.getQuantityChange())
            .adminUserId(adminUserId)
            .notes(request.getNotes())
            .build();
        stockMovementRepository.save(movement);

        log.info("Stock adjusted for size {} of product {}: change={}, newTotal={}, admin={}",
            productSize.getUkSize(), productSize.getProduct().getSku(), request.getQuantityChange(), newTotal, adminUserId);

        return ProductDto.AdminSizeStockResponse.builder()
            .sizeId(productSize.getId())
            .ukSize(productSize.getUkSize())
            .isAvailable(productSize.isAvailable())
            .inventoryId(inventory.getId())
            .totalStock(inventory.getTotalStock())
            .reservedStock(inventory.getReservedStock())
            .availableStock(inventory.getAvailableStock())
            .lowStockThreshold(inventory.getLowStockThreshold())
            .isLowStock(inventory.isLowStock())
            .build();
    }

    @Transactional(readOnly = true)
    public List<ProductDto.AdminSizeStockResponse> getLowStockAlerts() {
        return inventoryRepository.findLowStockInventories().stream()
            .map(inv -> ProductDto.AdminSizeStockResponse.builder()
                .sizeId(inv.getProductSize().getId())
                .ukSize(inv.getProductSize().getUkSize())
                .isAvailable(inv.getProductSize().isAvailable())
                .inventoryId(inv.getId())
                .totalStock(inv.getTotalStock())
                .reservedStock(inv.getReservedStock())
                .availableStock(inv.getAvailableStock())
                .lowStockThreshold(inv.getLowStockThreshold())
                .isLowStock(inv.isLowStock())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DashboardDto.StockMovementResponse> getStockMovements(UUID productSizeId, Pageable pageable) {
        return stockMovementRepository.findMovements(productSizeId, pageable)
            .map(m -> DashboardDto.StockMovementResponse.builder()
                .id(m.getId())
                .productSizeId(m.getProductSize().getId())
                .productName(m.getProductSize().getProduct().getName())
                .sku(m.getProductSize().getProduct().getSku())
                .ukSize(m.getProductSize().getUkSize())
                .movementType(m.getMovementType())
                .quantity(m.getQuantity())
                .referenceOrderId(m.getReferenceOrderId())
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .build());
    }
}
