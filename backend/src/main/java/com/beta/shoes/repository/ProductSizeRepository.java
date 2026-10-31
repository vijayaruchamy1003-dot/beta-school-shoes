package com.beta.shoes.repository;

import com.beta.shoes.entity.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, UUID> {
    List<ProductSize> findByProductId(UUID productId);
    Optional<ProductSize> findByProductIdAndUkSize(UUID productId, String ukSize);
}
