package com.beta.shoes.repository;

import com.beta.shoes.entity.BulkEnquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BulkEnquiryRepository extends JpaRepository<BulkEnquiry, UUID> {

    @Query("SELECT b FROM BulkEnquiry b WHERE (cast(:status as string) IS NULL OR b.status = :status) " +
           "AND (cast(:search as string) IS NULL OR LOWER(b.schoolName) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(b.contactPerson) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(b.email) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) " +
           "ORDER BY b.createdAt DESC")
    Page<BulkEnquiry> findEnquiries(@Param("status") String status, @Param("search") String search, Pageable pageable);

    long countByStatus(String status);
}
