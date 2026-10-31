package com.beta.shoes.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ProductDto {

    // Public Product View (Hides exact stock counts!)
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PublicProductResponse {
        private UUID id;
        private String shortId;
        private String sku;
        private String name;
        private String shortDescription;
        private String category;
        private BigDecimal basePrice;
        private String primaryImageUrl;
        private List<String> imageUrls;
        private List<PublicSizeResponse> sizes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PublicSizeResponse {
        private UUID id;
        private String ukSize;

        @JsonProperty("isAvailable")
        private boolean isAvailable; // true if available stock > 0

        @JsonProperty("available")
        public boolean isAvailableAlias() {
            return isAvailable;
        }
    }

    // Admin Product View (Includes exact stock counts, low stock alerts, active toggle)
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminProductResponse {
        private UUID id;
        private String shortId;
        private String sku;
        private String name;
        private String shortDescription;
        private String category;
        private BigDecimal basePrice;
        private boolean isActive;
        private String primaryImageUrl;
        private List<AdminImageResponse> images;
        private List<AdminSizeStockResponse> sizes;
        private int totalCombinedStock;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminImageResponse {
        private UUID id;
        private String imageUrl;
        private String storageKey;
        private boolean isPrimary;
        private int displayOrder;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminSizeStockResponse {
        private UUID sizeId;
        private String ukSize;
        private BigDecimal price;
        private boolean isAvailable;
        private UUID inventoryId;
        private int totalStock;
        private int reservedStock;
        private int availableStock;
        private int lowStockThreshold;
        private boolean isLowStock;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SizeInputDto {
        private UUID sizeId;
        private String ukSize;
        private BigDecimal price;
        private Integer count;
    }

    // Admin Create / Update Form Request
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductCreateUpdateRequest {
        @NotBlank(message = "Product SKU is required")
        private String sku;

        @NotBlank(message = "Product name is required")
        private String name;

        @NotBlank(message = "Short description is required")
        private String shortDescription;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
        private BigDecimal basePrice;

        private Boolean isActive;
        private List<String> initialSizes; // Optional initial size list e.g. ["UK 1", "UK 2"]
        private List<SizeInputDto> sizes;  // Full size details list with size, price, and count
    }

    // Admin Stock Adjustment Request
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockAdjustmentRequest {
        @NotNull(message = "Product size ID is required")
        private UUID productSizeId;

        @NotNull(message = "Stock change quantity is required")
        private Integer quantityChange; // Positive to add stock, negative to reduce

        @NotBlank(message = "Movement type is required (RESTOCK, ADJUSTMENT)")
        private String movementType;

        private String notes;
    }
}
