package com.beta.shoes.repository;

import com.beta.shoes.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    @Query("SELECT pi FROM ProductImage pi WHERE pi.storageKey LIKE CONCAT('%', :filename) OR pi.imageUrl LIKE CONCAT('%', :filename) ORDER BY pi.createdAt DESC")
    List<ProductImage> findByFilename(@Param("filename") String filename);
}
