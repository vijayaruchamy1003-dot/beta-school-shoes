package com.beta.shoes.repository;

import com.beta.shoes.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByProductSizeId(UUID productSizeId);

    // Row-level exclusive lock for concurrency-safe reservations and stock deduction
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.productSize.id = :productSizeId")
    Optional<Inventory> findWithLockByProductSizeId(@Param("productSizeId") UUID productSizeId);

    // Admin query for low-stock alerts
    @Query("SELECT i FROM Inventory i JOIN FETCH i.productSize ps JOIN FETCH ps.product p " +
           "WHERE (i.totalStock - i.reservedStock) <= i.lowStockThreshold ORDER BY (i.totalStock - i.reservedStock) ASC")
    List<Inventory> findLowStockInventories();
}
