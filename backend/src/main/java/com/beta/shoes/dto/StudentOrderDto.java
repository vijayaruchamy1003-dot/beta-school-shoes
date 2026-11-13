package com.beta.shoes.dto;

import com.beta.shoes.entity.SchoolOrderStatus;
import com.beta.shoes.entity.SchoolOrderStockPolicy;
import com.beta.shoes.entity.SchoolProductCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class StudentOrderDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private UUID productId;
        private UUID productSizeId;

        @NotNull(message = "Product category is required")
        private SchoolProductCategory category;

        @NotBlank(message = "Product name is required")
        private String productName;

        @NotBlank(message = "Size is required")
        private String sizeLabel;

        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity;

        @Builder.Default
        private BigDecimal unitPrice = BigDecimal.ZERO;

        private String itemNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateStudentOrderRequest {
        @NotNull(message = "School ID is required")
        private UUID schoolId;

        // Either studentId is provided, or newStudent is provided
        private UUID studentId;
        private StudentDto.StudentRequest newStudent;

        private String orderNumber;

        @Builder.Default
        private SchoolOrderStatus status = SchoolOrderStatus.DRAFT;

        @Builder.Default
        private SchoolOrderStockPolicy stockPolicy = SchoolOrderStockPolicy.BOOKING_ONLY;

        private String notes;

        @Builder.Default
        private LocalDate visitDate = LocalDate.now();

        @NotEmpty(message = "At least one item must be ordered")
        @Valid
        @Builder.Default
        private List<OrderItemRequest> items = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentOrderItemResponse {
        private UUID id;
        private UUID productId;
        private UUID productSizeId;
        private SchoolProductCategory category;
        private String productName;
        private String sizeLabel;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String itemNotes;
        private boolean stockReserved;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentOrderResponse {
        private UUID id;
        private UUID schoolId;
        private String schoolName;
        private UUID studentId;
        private String studentName;
        private String admissionNumber;
        private String gradeClass;
        private String section;
        private String parentContact;
        private String orderNumber;
        private String orderType;
        private SchoolOrderStatus status;
        private SchoolOrderStockPolicy stockPolicy;
        private int totalQuantity;
        private BigDecimal estimatedTotalAmount;
        private String notes;
        private LocalDate visitDate;
        private String createdByName;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        @Builder.Default
        private List<StudentOrderItemResponse> items = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateOrderStatusRequest {
        @NotNull(message = "Status is required")
        private SchoolOrderStatus status;

        private SchoolOrderStockPolicy stockPolicy;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkImportRowDto {
        private String admissionNumber;
        private String studentName;
        private String gradeClass;
        private String section;
        private String parentName;
        private String parentPhone;
        private String gender;
        private String category;
        private String productName;
        private String sizeLabel;
        private Integer quantity;
        private BigDecimal unitPrice;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkImportOrdersRequest {
        @NotNull(message = "School ID is required")
        private UUID schoolId;

        @Builder.Default
        private SchoolOrderStatus status = SchoolOrderStatus.CONFIRMED;

        @Builder.Default
        private SchoolOrderStockPolicy stockPolicy = SchoolOrderStockPolicy.BOOKING_ONLY;

        @Builder.Default
        private LocalDate visitDate = LocalDate.now();

        @NotEmpty(message = "At least one row is required for import")
        @Builder.Default
        private List<BulkImportRowDto> rows = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkImportOrdersResponse {
        private int studentsProcessed;
        private int newStudentsCreated;
        private int ordersCreated;
        private int totalItemsImported;
        @Builder.Default
        private List<StudentOrderResponse> orders = new ArrayList<>();
    }
}
