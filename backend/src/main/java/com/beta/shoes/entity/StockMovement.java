package com.beta.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_size_id", nullable = false)
    private ProductSize productSize;

    @Column(name = "movement_type", nullable = false, length = 32)
    private String movementType; // RESTOCK, SALE, RESERVATION, RELEASE, ADJUSTMENT

    @Column(nullable = false)
    private int quantity;

    @Column(name = "reference_order_id")
    private UUID referenceOrderId;

    @Column(name = "admin_user_id")
    private UUID adminUserId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
