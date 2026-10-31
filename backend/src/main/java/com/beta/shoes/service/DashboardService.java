package com.beta.shoes.service;

import com.beta.shoes.dto.DashboardDto;
import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.entity.Order;
import com.beta.shoes.repository.BulkEnquiryRepository;
import com.beta.shoes.repository.OrderRepository;
import com.beta.shoes.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final BulkEnquiryRepository bulkEnquiryRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public DashboardDto.AdminSummaryResponse getDashboardSummary() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByIsActiveTrue();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING_PAYMENT");
        long paidOrders = orderRepository.countByStatus("PAID") + orderRepository.countByStatus("PROCESSING") + orderRepository.countByStatus("SHIPPED") + orderRepository.countByStatus("DELIVERED");
        long newEnquiries = bulkEnquiryRepository.countByStatus("NEW");

        List<ProductDto.AdminSizeStockResponse> lowStockItems = inventoryService.getLowStockAlerts();

        // Calculate total revenue from paid/completed orders
        BigDecimal totalRevenue = orderRepository.findAll().stream()
            .filter(o -> "PAID".equals(o.getStatus()) || "PROCESSING".equals(o.getStatus()) || "SHIPPED".equals(o.getStatus()) || "DELIVERED".equals(o.getStatus()))
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardDto.AdminSummaryResponse.builder()
            .totalProducts(totalProducts)
            .activeProducts(activeProducts)
            .totalOrders(totalOrders)
            .pendingOrders(pendingOrders)
            .paidOrders(paidOrders)
            .totalRevenue(totalRevenue)
            .newBulkEnquiries(newEnquiries)
            .lowStockAlertsCount(lowStockItems.size())
            .lowStockItems(lowStockItems)
            .build();
    }
}
