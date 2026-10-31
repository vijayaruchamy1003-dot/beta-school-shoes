package com.beta.shoes.service;

import com.beta.shoes.dto.CartDto;
import com.beta.shoes.entity.*;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.CartItemRepository;
import com.beta.shoes.repository.CartRepository;
import com.beta.shoes.repository.ProductSizeRepository;
import com.beta.shoes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductSizeRepository productSizeRepository;
    private final UserRepository userRepository;

    @Value("${app.order.default-shipping-fee:0.00}")
    private BigDecimal defaultShippingFee;

    @Value("${app.order.tax-percentage:0.05}")
    private BigDecimal taxPercentage;

    @Transactional
    public Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                Cart newCart = Cart.builder()
                    .user(user)
                    .items(new ArrayList<>())
                    .build();
                return cartRepository.save(newCart);
            });
    }

    @Transactional(readOnly = true)
    public CartDto.CartResponse getCartResponse(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartDto.CartResponse addToCart(UUID userId, CartDto.AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        ProductSize productSize = productSizeRepository.findById(request.getProductSizeId())
            .orElseThrow(() -> new ResourceNotFoundException("Product size not found: " + request.getProductSizeId()));

        if (!productSize.isAvailable() || !productSize.getProduct().isActive()) {
            throw new BadRequestException("This product or size is currently not available for purchase.");
        }

        // Check stock availability
        Inventory inventory = productSize.getInventory();
        if (inventory == null || inventory.getAvailableStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() + ") exceeds available stock.");
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductSizeId(cart.getId(), productSize.getId())
            .orElse(null);

        if (existingItem != null) {
            int newQty = existingItem.getQuantity() + request.getQuantity();
            if (inventory.getAvailableStock() < newQty) {
                throw new BadRequestException("Cannot add more: total in cart would exceed available stock.");
            }
            existingItem.setQuantity(newQty);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                .cart(cart)
                .productSize(productSize)
                .quantity(request.getQuantity())
                .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartDto.CartResponse updateCartItem(UUID userId, UUID itemId, CartDto.UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
            .filter(i -> i.getCart().getId().equals(cart.getId()))
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        Inventory inventory = item.getProductSize().getInventory();
        if (inventory == null || inventory.getAvailableStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + (inventory != null ? inventory.getAvailableStock() : 0) + ").");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartDto.CartResponse removeCartItem(UUID userId, UUID itemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
            .filter(i -> i.getCart().getId().equals(cart.getId()))
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return mapToCartResponse(cart);
    }

    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());
    }

    public CartDto.CartResponse mapToCartResponse(Cart cart) {
        List<CartDto.CartItemResponse> itemResponses = cart.getItems().stream()
            .map(item -> {
                Product product = item.getProductSize().getProduct();
                BigDecimal price = product.getBasePrice();
                BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

                String primaryImg = product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElseGet(() -> product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

                boolean available = item.getProductSize().isAvailable() &&
                    item.getProductSize().getInventory() != null &&
                    item.getProductSize().getInventory().getAvailableStock() >= item.getQuantity();

                return CartDto.CartItemResponse.builder()
                    .itemId(item.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .sku(product.getSku())
                    .productSizeId(item.getProductSize().getId())
                    .ukSize(item.getProductSize().getUkSize())
                    .unitPrice(price)
                    .quantity(item.getQuantity())
                    .itemTotal(itemTotal)
                    .imageUrl(primaryImg)
                    .isAvailable(available)
                    .build();
            })
            .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
            .map(CartDto.CartItemResponse::getItemTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal estimatedTax = subtotal.multiply(taxPercentage).setScale(2, RoundingMode.HALF_UP);
        BigDecimal estimatedShipping = subtotal.compareTo(BigDecimal.ZERO) > 0 ? defaultShippingFee : BigDecimal.ZERO;
        BigDecimal estimatedTotal = subtotal.add(estimatedTax).add(estimatedShipping);
        int totalItemsCount = itemResponses.stream().mapToInt(CartDto.CartItemResponse::getQuantity).sum();

        return CartDto.CartResponse.builder()
            .cartId(cart.getId())
            .items(itemResponses)
            .totalItemsCount(totalItemsCount)
            .subtotal(subtotal)
            .estimatedTax(estimatedTax)
            .estimatedShipping(estimatedShipping)
            .estimatedTotal(estimatedTotal)
            .build();
    }
}
