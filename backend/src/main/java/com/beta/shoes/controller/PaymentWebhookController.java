package com.beta.shoes.controller;

import com.beta.shoes.exception.PaymentVerificationException;
import com.beta.shoes.service.CashfreePaymentService;
import com.beta.shoes.service.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/cashfree")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final CashfreePaymentService cashfreePaymentService;
    private final OrderService orderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/webhook")
    public ResponseEntity<String> handleCashfreeWebhook(
        @RequestHeader(value = "x-webhook-signature", required = false) String signature,
        @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp,
        @RequestBody String rawPayload
    ) {
        log.info("Received Cashfree payment webhook notification");

        // 1. Verify HMAC-SHA256 signature
        boolean isValidSignature = cashfreePaymentService.verifyWebhookSignature(signature, timestamp, rawPayload);
        if (!isValidSignature) {
            log.warn("Invalid Cashfree webhook signature rejected!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        try {
            // 2. Parse payload
            JsonNode root = objectMapper.readTree(rawPayload);
            JsonNode dataNode = root.path("data");

            String orderNumber = dataNode.path("order").path("order_id").asText();
            if (orderNumber == null || orderNumber.isBlank()) {
                orderNumber = root.path("orderId").asText(); // fallback for older event format
            }

            JsonNode paymentNode = dataNode.path("payment");
            String paymentStatus = paymentNode.path("payment_status").asText();
            String cfPaymentId = paymentNode.path("cf_payment_id").asText();
            String paymentMethod = paymentNode.path("payment_group").asText("ONLINE");

            log.info("Processing webhook for order {}: paymentStatus={}, cfPaymentId={}", orderNumber, paymentStatus, cfPaymentId);

            if ("SUCCESS".equalsIgnoreCase(paymentStatus)) {
                orderService.finalizePaymentSuccess(orderNumber, cfPaymentId, paymentMethod, rawPayload);
            } else if ("FAILED".equalsIgnoreCase(paymentStatus) || "USER_DROPPED".equalsIgnoreCase(paymentStatus)) {
                log.info("Payment failed or dropped for order {}. Releasing reservation.", orderNumber);
            }

            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception ex) {
            log.error("Error processing Cashfree webhook payload", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }
}
