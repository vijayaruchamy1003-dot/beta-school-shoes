package com.beta.shoes;

import com.beta.shoes.service.RazorpayPaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RazorpaySignatureVerificationTest {

    private RazorpayPaymentService razorpayPaymentService;
    private final String testKeySecret = "FiPceWCYrA5G2lUc8lA0FTtN";

    @BeforeEach
    void setUp() {
        razorpayPaymentService = new RazorpayPaymentService();
        ReflectionTestUtils.setField(razorpayPaymentService, "keyId", "rzp_test_TtHF4jwCRWFsGV");
        ReflectionTestUtils.setField(razorpayPaymentService, "keySecret", testKeySecret);
    }

    @Test
    void testValidRazorpaySignature() throws Exception {
        String orderId = "order_EKwxwAgItmmXdp";
        String paymentId = "pay_29MoEsz4dOFQDu";

        // Compute valid signature
        String data = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(testKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        String validSignature = hexString.toString();

        assertTrue(razorpayPaymentService.verifySignature(orderId, paymentId, validSignature));
    }

    @Test
    void testTamperedSignatureFails() {
        String orderId = "order_EKwxwAgItmmXdp";
        String paymentId = "pay_29MoEsz4dOFQDu";
        String forgedSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        assertFalse(razorpayPaymentService.verifySignature(orderId, paymentId, forgedSignature));
    }
}
