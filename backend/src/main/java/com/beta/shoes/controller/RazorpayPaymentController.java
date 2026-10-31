package com.beta.shoes.controller;

import com.beta.shoes.dto.OrderDto;
import com.beta.shoes.exception.PaymentVerificationException;
import com.beta.shoes.service.OrderService;
import com.beta.shoes.service.RazorpayPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/razorpay")
@RequiredArgsConstructor
@Slf4j
public class RazorpayPaymentController {

    private final RazorpayPaymentService razorpayPaymentService;
    private final OrderService orderService;

    @PostMapping("/verify")
    public ResponseEntity<OrderDto.OrderResponse> verifyPayment(
        @Valid @RequestBody OrderDto.RazorpayVerifyRequest request
    ) {
        log.info("Received Razorpay payment verification for order {}", request.getOrderNumber());

        boolean isValid = razorpayPaymentService.verifySignature(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
        );

        if (!isValid) {
            log.warn("Invalid Razorpay payment signature for order {}", request.getOrderNumber());
            throw new PaymentVerificationException("Razorpay payment signature verification failed");
        }

        orderService.finalizePaymentSuccess(
            request.getOrderNumber(),
            request.getRazorpayPaymentId(),
            "RAZORPAY",
            "razorpay_payment_id=" + request.getRazorpayPaymentId()
        );

        return ResponseEntity.ok(orderService.getOrderByNumber(request.getOrderNumber()));
    }
}
