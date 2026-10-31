package com.beta.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "student_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "order_number", nullable = false, unique = true, length = 64)
    private String orderNumber;

    @Column(name = "order_type", nullable = false, length = 32)
    @Builder.Default
    private String orderType = "SCHOOL_VISIT";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private SchoolOrderStatus status = SchoolOrderStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_policy", nullable = false, length = 32)
    @Builder.Default
    private SchoolOrderStockPolicy stockPolicy = SchoolOrderStockPolicy.BOOKING_ONLY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin_id")
    private User createdByAdmin;

    @Column(name = "total_quantity", nullable = false)
    @Builder.Default
    private int totalQuantity = 0;

    @Column(name = "estimated_total_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal estimatedTotalAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "visit_date", nullable = false)
    @Builder.Default
    private LocalDate visitDate = LocalDate.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StudentOrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public void addItem(StudentOrderItem item) {
        items.add(item);
        item.setOrder(this);
        recalculateTotals();
    }

    public void removeItem(StudentOrderItem item) {
        items.remove(item);
        item.setOrder(null);
        recalculateTotals();
    }

    public void recalculateTotals() {
        this.totalQuantity = items.stream().mapToInt(StudentOrderItem::getQuantity).sum();
        this.estimatedTotalAmount = items.stream()
            .map(StudentOrderItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
