package com.beta.shoes;

import com.beta.shoes.service.CashfreePaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CashfreeWebhookVerificationTest {

    private CashfreePaymentService paymentService;
    private final String secretKey = "test_merchant_secret_key_12345";

    @BeforeEach
    void setUp() {
        paymentService = new CashfreePaymentService();
        ReflectionTestUtils.setField(paymentService, "secretKey", secretKey);
        ReflectionTestUtils.setField(paymentService, "appId", "test_app_id");
    }

    @Test
    void verifyWebhookSignature_ValidSignature_ReturnsTrue() throws Exception {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String payload = "{\"data\":{\"order\":{\"order_id\":\"BETA-20261028-1001\"},\"payment\":{\"payment_status\":\"SUCCESS\"}}}";

        String dataToSign = timestamp + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String validSignature = Base64.getEncoder().encodeToString(mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8)));

        boolean result = paymentService.verifyWebhookSignature(validSignature, timestamp, payload);
        assertTrue(result, "Signature verification must succeed with valid HMAC-SHA256 signature");
    }

    @Test
    void verifyWebhookSignature_TamperedPayload_ReturnsFalse() throws Exception {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String originalPayload = "{\"data\":{\"order\":{\"order_id\":\"BETA-20261028-1001\"}}}";
        String tamperedPayload = "{\"data\":{\"order\":{\"order_id\":\"BETA-20261028-9999\"}}}";

        String dataToSign = timestamp + originalPayload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String originalSignature = Base64.getEncoder().encodeToString(mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8)));

        boolean result = paymentService.verifyWebhookSignature(originalSignature, timestamp, tamperedPayload);
        assertFalse(result, "Signature verification must reject tampered payload");
    }

    @Test
    void verifyWebhookSignature_ReplayAttackExpiredTimestamp_ReturnsFalse() throws Exception {
        // Timestamp 10 minutes in the past
        String expiredTimestamp = String.valueOf(System.currentTimeMillis() - (10 * 60 * 1000));
        String payload = "{\"data\":{\"order\":{\"order_id\":\"BETA-20261028-1001\"}}}";

        String dataToSign = expiredTimestamp + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = Base64.getEncoder().encodeToString(mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8)));

        boolean result = paymentService.verifyWebhookSignature(signature, expiredTimestamp, payload);
        assertFalse(result, "Signature verification must reject replay attacks with timestamp older than 5 minutes");
    }
}
