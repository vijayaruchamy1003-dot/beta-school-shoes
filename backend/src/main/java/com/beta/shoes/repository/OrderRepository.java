package com.beta.shoes.repository;

import com.beta.shoes.entity.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderNumber = :orderNumber")
    Optional<Order> findWithLockByOrderNumber(@Param("orderNumber") String orderNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findWithLockById(@Param("id") UUID id);

    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<Order> findByIdAndUserId(UUID id, UUID userId);

    Optional<Order> findByOrderNumberAndUserId(String orderNumber, UUID userId);

    // Find expired orders whose reservations must be released
    List<Order> findByStatusAndReservationExpiresAtBefore(String status, OffsetDateTime expiresBefore);

    // Admin filters
    @Query("SELECT o FROM Order o WHERE (cast(:status as string) IS NULL OR o.status = :status) " +
           "AND (cast(:search as string) IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(o.user.email) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findAdminOrders(@Param("status") String status, @Param("search") String search, Pageable pageable);

    long countByStatus(String status);
}
