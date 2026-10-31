package com.beta.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_size_id", nullable = false, unique = true)
    private ProductSize productSize;

    @Column(name = "total_stock", nullable = false)
    @Builder.Default
    private int totalStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    @Builder.Default
    private int reservedStock = 0;

    @Column(name = "low_stock_threshold", nullable = false)
    @Builder.Default
    private int lowStockThreshold = 5;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public int getAvailableStock() {
        return Math.max(0, totalStock - reservedStock);
    }

    public boolean isLowStock() {
        return getAvailableStock() <= lowStockThreshold;
    }
}
