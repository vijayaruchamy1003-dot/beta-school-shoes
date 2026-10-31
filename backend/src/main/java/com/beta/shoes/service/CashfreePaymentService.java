package com.beta.shoes.service;

import com.beta.shoes.entity.Order;
import com.beta.shoes.exception.PaymentVerificationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CashfreePaymentService {

    @Value("${cashfree.app-id:TEST_APP_ID}")
    private String appId;

    @Value("${cashfree.secret-key:TEST_SECRET_KEY}")
    private String secretKey;

    @Value("${cashfree.api-version:2023-08-01}")
    private String apiVersion;

    @Value("${cashfree.base-url:https://sandbox.cashfree.com/pg}")
    private String baseUrl;

    @Value("${cashfree.return-url:http://localhost:5173/orders/{order_id}/status}")
    private String returnUrl;

    @Value("${cashfree.notify-url:http://localhost:8080/api/payments/cashfree/webhook}")
    private String notifyUrl;

    @Value("${payment.direct-link:https://razorpay.me/@vijayaruchamy}")
    private String directPaymentUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record CashfreeOrderResult(String paymentSessionId, String cfOrderId, String paymentUrl) {}

    /**
     * Creates a payment order on Cashfree PG via official REST API, or provides direct payment link.
     */
    public CashfreeOrderResult createPaymentOrder(Order order) {
        // If direct payment link is configured or test credentials are used, return direct payment link
        if (directPaymentUrl != null && !directPaymentUrl.isBlank()) {
            log.info("Providing direct payment link {} for order {}", directPaymentUrl, order.getOrderNumber());
            String sessionToken = "direct_" + order.getOrderNumber();
            return new CashfreeOrderResult(sessionToken, order.getOrderNumber(), directPaymentUrl);
        }

        if ("TEST_APP_ID".equals(appId) || "TEST_SECRET_KEY".equals(secretKey)) {
            log.info("Using simulated payment link for order {}", order.getOrderNumber());
            return new CashfreeOrderResult("session_sim_" + UUID.randomUUID(), "cf_" + order.getOrderNumber(), "https://razorpay.me/@vijayaruchamy");
        }

        try {
            String url = baseUrl + "/orders";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", appId);
            headers.set("x-client-secret", secretKey);
            headers.set("x-api-version", apiVersion);

            Map<String, Object> customerDetails = new HashMap<>();
            customerDetails.put("customer_id", "cust_" + order.getUser().getId().toString().replace("-", "").substring(0, 16));
            customerDetails.put("customer_email", order.getUser().getEmail());
            customerDetails.put("customer_phone", order.getUser().getPhone() != null ? order.getUser().getPhone() : "9845012345");
            customerDetails.put("customer_name", order.getUser().getFirstName() + " " + order.getUser().getLastName());

            Map<String, Object> orderMeta = new HashMap<>();
            orderMeta.put("return_url", returnUrl.replace("{order_id}", order.getOrderNumber()));
            orderMeta.put("notify_url", notifyUrl);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("order_id", order.getOrderNumber());
            requestBody.put("order_amount", order.getTotalAmount());
            requestBody.put("order_currency", "INR");
            requestBody.put("customer_details", customerDetails);
            requestBody.put("order_meta", orderMeta);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String paymentSessionId = root.path("payment_session_id").asText();
                String cfOrderId = root.path("cf_order_id").asText();
                String paymentUrl = root.path("payments").path("url").asText();

                return new CashfreeOrderResult(paymentSessionId, cfOrderId, paymentUrl);
            } else {
                throw new PaymentVerificationException("Cashfree order creation returned non-200: " + response.getStatusCode());
            }
        } catch (PaymentVerificationException pve) {
            throw pve;
        } catch (Exception ex) {
            log.error("Failed to create Cashfree order for {}", order.getOrderNumber(), ex);
            // Fallback for network timeouts or sandbox unavailability
            String simulatedSession = "session_sim_" + UUID.randomUUID();
            return new CashfreeOrderResult(simulatedSession, "cf_" + order.getOrderNumber(), null);
        }
    }

    /**
     * Validates Cashfree Webhook Signature using HMAC-SHA256 according to official Cashfree documentation.
     * signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
     */
    public boolean verifyWebhookSignature(String signatureHeader, String timestampHeader, String rawPayload) {
        if ("TEST_SECRET_KEY".equals(secretKey)) {
            // Local dev mode with placeholder secret
            return true;
        }

        if (signatureHeader == null || timestampHeader == null || rawPayload == null) {
            return false;
        }

        try {
            // Anti-replay attack check: ensure timestamp is within 5 minutes
            long timestamp = Long.parseLong(timestampHeader);
            long currentTime = System.currentTimeMillis();
            if (Math.abs(currentTime - timestamp) > 300_000) {
                log.warn("Cashfree webhook timestamp expired or drifted: timestamp={}, current={}", timestamp, currentTime);
                return false;
            }

            String dataToSign = timestampHeader + rawPayload;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hmacBytes = mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8));
            String computedSignature = Base64.getEncoder().encodeToString(hmacBytes);

            return computedSignature.equals(signatureHeader);
        } catch (Exception e) {
            log.error("Error verifying Cashfree webhook signature", e);
            return false;
        }
    }
}
