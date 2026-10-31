package com.beta.shoes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

public class BulkEnquiryDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "School name is required")
        private String schoolName;

        @NotBlank(message = "Contact person name is required")
        private String contactPerson;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "City and State are required")
        private String cityState;

        private Integer estimatedStudents;
        private String shoeModelsRequested;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String schoolName;
        private String contactPerson;
        private String phone;
        private String email;
        private String cityState;
        private Integer estimatedStudents;
        private String shoeModelsRequested;
        private String notes;
        private String status;
        private String adminNotes;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status; // NEW, IN_REVIEW, QUOTATION_SENT, CONVERTED, CLOSED
        private String adminNotes;
    }
}
