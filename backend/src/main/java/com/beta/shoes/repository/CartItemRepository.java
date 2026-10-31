package com.beta.shoes.repository;

import com.beta.shoes.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByCartIdAndProductSizeId(UUID cartId, UUID productSizeId);
    void deleteByCartId(UUID cartId);
}
