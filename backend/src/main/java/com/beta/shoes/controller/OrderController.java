package com.beta.shoes.controller;

import com.beta.shoes.dto.OrderDto;
import com.beta.shoes.security.UserDetailsImpl;
import com.beta.shoes.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderDto.CheckoutResponse> checkout(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @Valid @RequestBody OrderDto.CheckoutRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(userPrincipal.getId(), request));
    }

    @GetMapping("/mine")
    public ResponseEntity<Page<OrderDto.OrderResponse>> getMyOrders(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(orderService.getCustomerOrders(userPrincipal.getId(), PageRequest.of(page, size)));
    }

    @GetMapping("/mine/{orderId}")
    public ResponseEntity<OrderDto.OrderResponse> getMyOrderById(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @PathVariable UUID orderId
    ) {
        return ResponseEntity.ok(orderService.getCustomerOrderById(userPrincipal.getId(), orderId));
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderDto.OrderResponse> trackOrderByNumber(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @PathVariable String orderNumber
    ) {
        return ResponseEntity.ok(orderService.getCustomerOrderByNumber(userPrincipal.getId(), orderNumber));
    }
}
