package com.beta.shoes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckoutRequest {
        @NotBlank(message = "Recipient name is required")
        private String recipientName;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Address line 1 is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "Postal code is required")
        private String postalCode;

        private String customerNotes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckoutResponse {
        private UUID orderId;
        private String orderNumber;
        private BigDecimal totalAmount;
        private String status;
        private OffsetDateTime reservationExpiresAt;
        
        // Razorpay Payment Details
        private String razorpayKeyId;
        private String razorpayOrderId;
        private Long razorpayAmountInPaise;
        private String currency;

        // Legacy / Alternative PG links
        private String cashfreePaymentSessionId;
        private String cashfreeOrderId;
        private String paymentUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RazorpayVerifyRequest {
        @NotBlank(message = "Order number is required")
        private String orderNumber;

        @NotBlank(message = "Razorpay order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay signature is required")
        private String razorpaySignature;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private UUID id;
        private String orderNumber;
        private String status;
        private BigDecimal totalAmount;
        private BigDecimal taxAmount;
        private BigDecimal shippingAmount;
        private String shippingAddressJson;
        private String customerNotes;
        private OffsetDateTime reservationExpiresAt;
        private List<OrderItemResponse> items;
        private List<PaymentResponse> payments;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private UUID id;
        private UUID productId;
        private UUID productSizeId;
        private String productName;
        private String sizeLabel;
        private BigDecimal unitPrice;
        private int quantity;
        private BigDecimal subtotal;
        private String imageUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentResponse {
        private UUID id;
        private String gatewayOrderId;
        private String gatewayPaymentId;
        private String paymentMethod;
        private BigDecimal amount;
        private String currency;
        private String status;
        private OffsetDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status; // PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }
}
