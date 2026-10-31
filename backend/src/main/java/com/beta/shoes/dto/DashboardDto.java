package com.beta.shoes.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class DashboardDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminSummaryResponse {
        private long totalProducts;
        private long activeProducts;
        private long totalOrders;
        private long pendingOrders;
        private long paidOrders;
        private BigDecimal totalRevenue;
        private long newBulkEnquiries;
        private long lowStockAlertsCount;
        private List<ProductDto.AdminSizeStockResponse> lowStockItems;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockMovementResponse {
        private UUID id;
        private UUID productSizeId;
        private String productName;
        private String sku;
        private String ukSize;
        private String movementType;
        private int quantity;
        private UUID referenceOrderId;
        private String notes;
        private OffsetDateTime createdAt;
    }
}
