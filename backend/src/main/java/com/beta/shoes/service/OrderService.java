package com.beta.shoes.service;

import com.beta.shoes.dto.CartDto;
import com.beta.shoes.dto.OrderDto;
import com.beta.shoes.entity.*;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.InsufficientStockException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CashfreePaymentService cashfreePaymentService;
    private final RazorpayPaymentService razorpayPaymentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.order.reservation-minutes:15}")
    private int reservationMinutes;

    @Value("${app.order.default-shipping-fee:0.00}")
    private BigDecimal defaultShippingFee;

    @Value("${app.order.tax-percentage:0.05}")
    private BigDecimal taxPercentage;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Concurrency-safe Checkout:
     * Locks inventory rows for update, verifies available stock, increments reserved_stock,
     * creates immutable order snapshot, empties cart, and initiates Cashfree session.
     */
    @Transactional
    public OrderDto.CheckoutResponse checkout(UUID userId, OrderDto.CheckoutRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new BadRequestException("Shopping cart is empty."));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty shopping cart.");
        }

        // 1. Calculate totals server-side
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        String orderNumber = generateUniqueOrderNumber();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(reservationMinutes);

        Order order = Order.builder()
            .orderNumber(orderNumber)
            .user(user)
            .status("PENDING_PAYMENT")
            .reservationExpiresAt(expiresAt)
            .customerNotes(request.getCustomerNotes())
            .build();

        try {
            order.setShippingAddressJson(objectMapper.writeValueAsString(request));
        } catch (Exception e) {
            order.setShippingAddressJson("{}");
        }

        // 2. Lock inventory rows and verify/reserve stock
        for (CartItem cartItem : cart.getItems()) {
            ProductSize size = cartItem.getProductSize();
            Product product = size.getProduct();

            if (!product.isActive() || !size.isAvailable()) {
                throw new BadRequestException("Item '" + product.getName() + " (" + size.getUkSize() + ")' is no longer available.");
            }

            // PESSIMISTIC_WRITE row lock on inventory
            Inventory inventory = inventoryRepository.findWithLockByProductSizeId(size.getId())
                .orElseThrow(() -> new InsufficientStockException("Inventory not found for size: " + size.getUkSize()));

            int requestedQty = cartItem.getQuantity();
            int available = inventory.getAvailableStock();

            if (available < requestedQty) {
                throw new InsufficientStockException("Insufficient stock for " + product.getName() + " (Size: " + size.getUkSize() + "). Available: " + available + ", Requested: " + requestedQty);
            }

            // Reserve stock
            inventory.setReservedStock(inventory.getReservedStock() + requestedQty);
            inventoryRepository.save(inventory);

            // Record reservation movement
            StockMovement movement = StockMovement.builder()
                .productSize(size)
                .movementType("RESERVATION")
                .quantity(requestedQty)
                .notes("Checkout reservation for order " + orderNumber)
                .build();
            stockMovementRepository.save(movement);

            BigDecimal itemPrice = product.getBasePrice();
            BigDecimal itemSubtotal = itemPrice.multiply(BigDecimal.valueOf(requestedQty));
            subtotal = subtotal.add(itemSubtotal);

            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .productSize(size)
                .productNameSnapshot(product.getName())
                .sizeLabelSnapshot(size.getUkSize())
                .unitPriceSnapshot(itemPrice)
                .quantity(requestedQty)
                .subtotal(itemSubtotal)
                .build();

            orderItems.add(orderItem);
        }

        BigDecimal taxAmount = subtotal.multiply(taxPercentage).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount).add(defaultShippingFee);

        order.setTotalAmount(totalAmount);
        order.setTaxAmount(taxAmount);
        order.setShippingAmount(defaultShippingFee);
        order.setItems(orderItems);

        order = orderRepository.save(order);

        // 3. Clear user cart
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());

        // 4. Create Razorpay payment order
        RazorpayPaymentService.RazorpayOrderResult rzpResult = razorpayPaymentService.createOrder(order);

        // Record initiated payment
        Payment payment = Payment.builder()
            .order(order)
            .gatewayOrderId(rzpResult.razorpayOrderId())
            .amount(totalAmount)
            .currency("INR")
            .status("INITIATED")
            .build();
        paymentRepository.save(payment);

        log.info("Created order {} with total INR {}, reservation expires at {}, razorpayOrderId {}",
            orderNumber, totalAmount, expiresAt, rzpResult.razorpayOrderId());

        return OrderDto.CheckoutResponse.builder()
            .orderId(order.getId())
            .orderNumber(order.getOrderNumber())
            .totalAmount(totalAmount)
            .status(order.getStatus())
            .reservationExpiresAt(order.getReservationExpiresAt())
            .razorpayKeyId(rzpResult.keyId())
            .razorpayOrderId(rzpResult.razorpayOrderId())
            .razorpayAmountInPaise(rzpResult.amountInPaise())
            .currency(rzpResult.currency())
            .build();
    }

    /**
     * Idempotent Payment Finalization:
     * Invoked upon verified Cashfree webhook signature or verified redirect.
     * Deducts reserved stock permanently into a finalized SALE.
     */
    @Transactional
    public void finalizePaymentSuccess(String orderNumber, String gatewayPaymentId, String paymentMethod, String rawWebhook) {
        Order order = orderRepository.findWithLockByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        if ("PAID".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus()) || "SHIPPED".equals(order.getStatus())) {
            log.info("Order {} is already marked as PAID. Skipping duplicate processing.", orderNumber);
            return;
        }

        // Deduct stock permanently: total_stock -= qty, reserved_stock -= qty
        for (OrderItem item : order.getItems()) {
            Inventory inventory = inventoryRepository.findWithLockByProductSizeId(item.getProductSize().getId())
                .orElse(null);

            if (inventory != null) {
                int qty = item.getQuantity();
                inventory.setTotalStock(Math.max(0, inventory.getTotalStock() - qty));
                inventory.setReservedStock(Math.max(0, inventory.getReservedStock() - qty));
                inventoryRepository.save(inventory);

                StockMovement saleMovement = StockMovement.builder()
                    .productSize(item.getProductSize())
                    .movementType("SALE")
                    .quantity(-qty)
                    .referenceOrderId(order.getId())
                    .notes("Sale finalized for order " + orderNumber)
                    .build();
                stockMovementRepository.save(saleMovement);
            }
        }

        order.setStatus("PAID");
        order.setReservationExpiresAt(null);
        orderRepository.save(order);

        // Record or update payment record
        Payment payment = Payment.builder()
            .order(order)
            .gatewayPaymentId(gatewayPaymentId)
            .paymentMethod(paymentMethod != null ? paymentMethod : "ONLINE")
            .amount(order.getTotalAmount())
            .currency("INR")
            .status("SUCCESS")
            .rawWebhookPayload(rawWebhook)
            .build();
        paymentRepository.save(payment);

        log.info("Order {} successfully PAID and stock deducted permanently.", orderNumber);
    }

    /**
     * Release stock reservation for failed/cancelled orders.
     */
    @Transactional
    public void releaseOrderReservation(Order order, String newStatus, String reason) {
        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            return;
        }

        for (OrderItem item : order.getItems()) {
            Inventory inventory = inventoryRepository.findWithLockByProductSizeId(item.getProductSize().getId())
                .orElse(null);

            if (inventory != null) {
                int qty = item.getQuantity();
                inventory.setReservedStock(Math.max(0, inventory.getReservedStock() - qty));
                inventoryRepository.save(inventory);

                StockMovement releaseMovement = StockMovement.builder()
                    .productSize(item.getProductSize())
                    .movementType("RELEASE")
                    .quantity(qty)
                    .referenceOrderId(order.getId())
                    .notes("Reservation released: " + reason)
                    .build();
                stockMovementRepository.save(releaseMovement);
            }
        }

        order.setStatus(newStatus);
        order.setReservationExpiresAt(null);
        orderRepository.save(order);
        log.info("Released stock reservation for order {}: reason={}", order.getOrderNumber(), reason);
    }

    /**
     * Scheduled Job: Runs every minute to clean up expired uncompleted reservations.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredReservations() {
        OffsetDateTime now = OffsetDateTime.now();
        List<Order> expiredOrders = orderRepository.findByStatusAndReservationExpiresAtBefore("PENDING_PAYMENT", now);

        for (Order order : expiredOrders) {
            try {
                releaseOrderReservation(order, "PAYMENT_FAILED", "Checkout reservation timer expired (" + reservationMinutes + "m)");
            } catch (Exception ex) {
                log.error("Failed to release expired order {}", order.getOrderNumber(), ex);
            }
        }
    }

    // --- Order Retrieval (Customer & Admin) ---

    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getCustomerOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::mapToOrderResponse);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getCustomerOrderById(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getCustomerOrderByNumber(UUID userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getAdminOrders(String status, String search, Pageable pageable) {
        String cleanStatus = org.springframework.util.StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status) ? status.trim() : null;
        String cleanSearch = org.springframework.util.StringUtils.hasText(search) ? search.trim() : null;
        return orderRepository.findAdminOrders(cleanStatus, cleanSearch, pageable)
            .map(this::mapToOrderResponse);
    }

    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(UUID orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if ("CANCELLED".equalsIgnoreCase(newStatus) && "PENDING_PAYMENT".equals(order.getStatus())) {
            releaseOrderReservation(order, "CANCELLED", "Cancelled by Admin");
        } else {
            order.setStatus(newStatus.toUpperCase());
            order = orderRepository.save(order);
        }

        return mapToOrderResponse(order);
    }

    private OrderDto.OrderResponse mapToOrderResponse(Order order) {
        List<OrderDto.OrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> {
                String img = item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0).getImageUrl();
                return OrderDto.OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productSizeId(item.getProductSize().getId())
                    .productName(item.getProductNameSnapshot())
                    .sizeLabel(item.getSizeLabelSnapshot())
                    .unitPrice(item.getUnitPriceSnapshot())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .imageUrl(img)
                    .build();
            })
            .collect(Collectors.toList());

        List<OrderDto.PaymentResponse> paymentResponses = order.getPayments().stream()
            .map(p -> OrderDto.PaymentResponse.builder()
                .id(p.getId())
                .gatewayOrderId(p.getGatewayOrderId())
                .gatewayPaymentId(p.getGatewayPaymentId())
                .paymentMethod(p.getPaymentMethod())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        return OrderDto.OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .status(order.getStatus())
            .totalAmount(order.getTotalAmount())
            .taxAmount(order.getTaxAmount())
            .shippingAmount(order.getShippingAmount())
            .shippingAddressJson(order.getShippingAddressJson())
            .customerNotes(order.getCustomerNotes())
            .reservationExpiresAt(order.getReservationExpiresAt())
            .items(itemResponses)
            .payments(paymentResponses)
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }

    private String generateUniqueOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int randomNum = 1000 + secureRandom.nextInt(9000);
        return "BETA-" + dateStr + "-" + randomNum;
    }
}
