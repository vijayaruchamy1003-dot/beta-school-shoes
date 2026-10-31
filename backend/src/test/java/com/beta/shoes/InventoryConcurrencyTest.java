package com.beta.shoes;

import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.entity.Inventory;
import com.beta.shoes.entity.Product;
import com.beta.shoes.entity.ProductSize;
import com.beta.shoes.entity.StockMovement;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.repository.InventoryRepository;
import com.beta.shoes.repository.ProductSizeRepository;
import com.beta.shoes.repository.StockMovementRepository;
import com.beta.shoes.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryConcurrencyTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductSizeRepository productSizeRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID sizeId;
    private ProductSize productSize;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        sizeId = UUID.randomUUID();
        Product product = Product.builder()
            .id(UUID.randomUUID())
            .sku("BETA-SCH-OX01")
            .name("BETA Classic Oxford")
            .basePrice(BigDecimal.valueOf(799))
            .build();

        productSize = ProductSize.builder()
            .id(sizeId)
            .product(product)
            .ukSize("UK 5")
            .isAvailable(true)
            .build();

        inventory = Inventory.builder()
            .id(UUID.randomUUID())
            .productSize(productSize)
            .totalStock(50)
            .reservedStock(10)
            .lowStockThreshold(5)
            .build();
    }

    @Test
    void adjustStock_RestockIncreasesTotal_AndRecordsMovement() {
        UUID adminId = UUID.randomUUID();
        ProductDto.StockAdjustmentRequest request = ProductDto.StockAdjustmentRequest.builder()
            .productSizeId(sizeId)
            .quantityChange(25)
            .movementType("RESTOCK")
            .notes("Factory batch arrival")
            .build();

        when(productSizeRepository.findById(sizeId)).thenReturn(Optional.of(productSize));
        when(inventoryRepository.findWithLockByProductSizeId(sizeId)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        ProductDto.AdminSizeStockResponse response = inventoryService.adjustStock(adminId, request);

        assertNotNull(response);
        assertEquals(75, response.getTotalStock());
        assertEquals(10, response.getReservedStock());
        assertEquals(65, response.getAvailableStock());

        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    void adjustStock_CannotReduceBelowReservedStock() {
        UUID adminId = UUID.randomUUID();
        // Currently totalStock = 50, reserved = 10. Trying to reduce by -45 would leave 5, less than 10 reserved.
        ProductDto.StockAdjustmentRequest request = ProductDto.StockAdjustmentRequest.builder()
            .productSizeId(sizeId)
            .quantityChange(-45)
            .movementType("ADJUSTMENT")
            .build();

        when(productSizeRepository.findById(sizeId)).thenReturn(Optional.of(productSize));
        when(inventoryRepository.findWithLockByProductSizeId(sizeId)).thenReturn(Optional.of(inventory));

        assertThrows(BadRequestException.class, () -> inventoryService.adjustStock(adminId, request));
        verify(stockMovementRepository, never()).save(any(StockMovement.class));
    }
}
