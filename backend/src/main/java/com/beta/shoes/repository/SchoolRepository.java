package com.beta.shoes.repository;

import com.beta.shoes.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchoolRepository extends JpaRepository<School, UUID> {

    Optional<School> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    @Query("SELECT s FROM School s WHERE " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.phone) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<School> searchSchools(@Param("search") String search,
                               @Param("isActive") Boolean isActive,
                               Pageable pageable);
}
