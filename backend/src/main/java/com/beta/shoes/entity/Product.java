package com.beta.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "short_description", nullable = false, columnDefinition = "TEXT")
    private String shortDescription;

    @Column(nullable = false, length = 64)
    private String category; // BOYS, GIRLS, MEN, WOMEN, SCHOOL_SHOES (or SHOES, SHIRTS, PANTS, etc.)

    @Column(name = "catalog_type", nullable = false, length = 32)
    @Builder.Default
    private String catalogType = "WEBSITE"; // WEBSITE or SCHOOL_ORDER

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "mrp", precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(name = "is_bestseller", nullable = false)
    @Builder.Default
    private boolean isBestseller = false;

    @Column(name = "is_new_arrival", nullable = false)
    @Builder.Default
    private boolean isNewArrival = false;

    @Column(name = "badge_text", length = 64)
    private String badgeText;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductSize> sizes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
