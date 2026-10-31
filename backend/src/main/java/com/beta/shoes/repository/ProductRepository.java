package com.beta.shoes.repository;

import com.beta.shoes.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySku(String sku);

    // Public active products with search and category filtering
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.sizes s WHERE p.isActive = true " +
           "AND (cast(:category as string) IS NULL OR p.category = :category) " +
           "AND (cast(:search as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) " +
           "AND (cast(:ukSize as string) IS NULL OR (s.ukSize = :ukSize AND s.isAvailable = true))")
    Page<Product> findPublicProducts(
        @Param("category") String category,
        @Param("search") String search,
        @Param("ukSize") String ukSize,
        Pageable pageable
    );

    // Admin catalogue (includes inactive)
    @Query("SELECT p FROM Product p WHERE " +
           "(cast(:category as string) IS NULL OR p.category = :category) " +
           "AND (cast(:search as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Product> findAdminProducts(
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );

    long countByIsActiveTrue();
}
