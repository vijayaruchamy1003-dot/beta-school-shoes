package com.beta.shoes.repository;

import com.beta.shoes.entity.Student;
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
public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findBySchoolIdAndAdmissionNumber(UUID schoolId, String admissionNumber);

    boolean existsBySchoolIdAndAdmissionNumber(UUID schoolId, String admissionNumber);

    boolean existsBySchoolIdAndAdmissionNumberAndIdNot(UUID schoolId, String admissionNumber, UUID id);

    long countBySchoolId(UUID schoolId);

    @Query("SELECT s FROM Student s WHERE s.school.id = :schoolId " +
           "AND (:search IS NULL OR LOWER(s.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.admissionNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.parentName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           " OR LOWER(s.parentPhone) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:gradeClass IS NULL OR s.gradeClass = :gradeClass) " +
           "AND (:section IS NULL OR s.section = :section) " +
           "AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<Student> searchStudents(@Param("schoolId") UUID schoolId,
                                 @Param("search") String search,
                                 @Param("gradeClass") String gradeClass,
                                 @Param("section") String section,
                                 @Param("isActive") Boolean isActive,
                                 Pageable pageable);

    @Query("SELECT DISTINCT s.gradeClass FROM Student s WHERE s.school.id = :schoolId ORDER BY s.gradeClass")
    List<String> findDistinctClasses(@Param("schoolId") UUID schoolId);

    @Query("SELECT DISTINCT s.section FROM Student s WHERE s.school.id = :schoolId AND s.section IS NOT NULL ORDER BY s.section")
    List<String> findDistinctSections(@Param("schoolId") UUID schoolId);
}
