package com.beta.shoes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class UserManagementDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private boolean enabled;
        private List<String> roles;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateUserRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "First name is required")
        private String firstName;

        private String lastName;
        private String phone;
        private List<String> roles;

        @Builder.Default
        private Boolean enabled = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        // Optional: only updated if non-empty
        private String password;

        @NotBlank(message = "First name is required")
        private String firstName;

        private String lastName;
        private String phone;
        private List<String> roles;
        private Boolean enabled;
    }
}
