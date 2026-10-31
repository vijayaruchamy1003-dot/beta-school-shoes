package com.beta.shoes.controller;

import com.beta.shoes.dto.CartDto;
import com.beta.shoes.security.UserDetailsImpl;
import com.beta.shoes.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto.CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        return ResponseEntity.ok(cartService.getCartResponse(userPrincipal.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto.CartResponse> addToCart(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @Valid @RequestBody CartDto.AddToCartRequest request
    ) {
        return ResponseEntity.ok(cartService.addToCart(userPrincipal.getId(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto.CartResponse> updateItem(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @PathVariable UUID itemId,
        @Valid @RequestBody CartDto.UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateCartItem(userPrincipal.getId(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto.CartResponse> removeItem(
        @AuthenticationPrincipal UserDetailsImpl userPrincipal,
        @PathVariable UUID itemId
    ) {
        return ResponseEntity.ok(cartService.removeCartItem(userPrincipal.getId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
