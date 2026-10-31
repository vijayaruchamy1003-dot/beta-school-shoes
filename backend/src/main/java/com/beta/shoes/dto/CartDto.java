package com.beta.shoes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddToCartRequest {
        @NotNull(message = "Product size ID is required")
        private UUID productSizeId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateCartItemRequest {
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartResponse {
        private UUID cartId;
        private List<CartItemResponse> items;
        private int totalItemsCount;
        private BigDecimal subtotal;
        private BigDecimal estimatedTax;
        private BigDecimal estimatedShipping;
        private BigDecimal estimatedTotal;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private UUID itemId;
        private UUID productId;
        private String productName;
        private String sku;
        private UUID productSizeId;
        private String ukSize;
        private BigDecimal unitPrice;
        private int quantity;
        private BigDecimal itemTotal;
        private String imageUrl;
        private boolean isAvailable;
    }
}
