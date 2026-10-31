package com.beta.shoes.repository;

import com.beta.shoes.entity.SchoolOrderStatus;
import com.beta.shoes.entity.StudentOrder;
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
public interface StudentOrderRepository extends JpaRepository<StudentOrder, UUID> {

    Optional<StudentOrder> findByOrderNumber(String orderNumber);

    List<StudentOrder> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    List<StudentOrder> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);

    long countBySchoolId(UUID schoolId);

    long countBySchoolIdAndStatusNot(UUID schoolId, SchoolOrderStatus status);

    @Query("SELECT o FROM StudentOrder o WHERE (:schoolId IS NULL OR o.school.id = :schoolId) " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(o.student.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(o.student.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(o.student.admissionNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(o.student.gradeClass) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(o.school.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<StudentOrder> searchOrders(@Param("schoolId") UUID schoolId,
                                    @Param("search") String search,
                                    @Param("status") SchoolOrderStatus status,
                                    Pageable pageable);
}
