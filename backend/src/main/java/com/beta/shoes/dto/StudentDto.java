package com.beta.shoes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

public class StudentDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentRequest {
        @NotNull(message = "School ID is required")
        private UUID schoolId;

        @NotBlank(message = "Admission / Student ID is required")
        private String admissionNumber;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Class is required")
        private String gradeClass;

        private String section;
        private String parentName;
        private String parentPhone;
        private String parentEmail;
        private String gender;

        @Builder.Default
        private Boolean isActive = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentResponse {
        private UUID id;
        private UUID schoolId;
        private String schoolName;
        private String admissionNumber;
        private String firstName;
        private String lastName;
        private String fullName;
        private String gradeClass;
        private String section;
        private String parentName;
        private String parentPhone;
        private String parentEmail;
        private String gender;
        private boolean isActive;
        private int ordersCount;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }
}
