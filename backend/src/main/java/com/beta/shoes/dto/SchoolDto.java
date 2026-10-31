package com.beta.shoes.dto;

import com.beta.shoes.entity.SchoolProductCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class SchoolDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SchoolRequest {
        @NotBlank(message = "School name is required")
        private String name;

        @NotBlank(message = "School code is required")
        private String code;

        @NotBlank(message = "School address is required")
        private String address;

        @NotBlank(message = "Contact person is required")
        private String contactPerson;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @Builder.Default
        private Boolean isActive = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SchoolResponse {
        private UUID id;
        private String name;
        private String code;
        private String address;
        private String contactPerson;
        private String phone;
        private String email;
        private boolean isActive;
        private long totalStudents;
        private long totalOrders;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySizeSummary {
        private SchoolProductCategory category;
        private String sizeLabel;
        private int quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SchoolSummaryResponse {
        private UUID schoolId;
        private String schoolName;
        private String schoolCode;
        private long totalStudents;
        private long totalOrders;
        private int totalItemsBooked;

        // Required Category Totals: shoes, shirts, pants, shorts, T-shirts, socks and bags
        private int shoesCount;
        private int shirtsCount;
        private int pantsCount;
        private int shortsCount;
        private int tshirtsCount;
        private int socksCount;
        private int bagsCount;

        @Builder.Default
        private List<CategorySizeSummary> categorySizeBreakdown = new ArrayList<>();
    }
}
