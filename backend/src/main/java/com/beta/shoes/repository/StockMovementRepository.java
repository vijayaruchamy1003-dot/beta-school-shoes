package com.beta.shoes.repository;

import com.beta.shoes.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    @Query("SELECT sm FROM StockMovement sm JOIN FETCH sm.productSize ps JOIN FETCH ps.product p " +
           "WHERE (:productSizeId IS NULL OR ps.id = :productSizeId) " +
           "ORDER BY sm.createdAt DESC")
    Page<StockMovement> findMovements(@Param("productSizeId") UUID productSizeId, Pageable pageable);
}
