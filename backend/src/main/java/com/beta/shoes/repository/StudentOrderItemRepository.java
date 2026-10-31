package com.beta.shoes.repository;

import com.beta.shoes.entity.SchoolOrderStatus;
import com.beta.shoes.entity.StudentOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentOrderItemRepository extends JpaRepository<StudentOrderItem, UUID> {

    List<StudentOrderItem> findByOrderId(UUID orderId);

    @Query("SELECT item.category, COALESCE(SUM(item.quantity), 0) " +
           "FROM StudentOrderItem item " +
           "WHERE item.order.school.id = :schoolId " +
           "AND item.order.status != :excludeStatus " +
           "GROUP BY item.category")
    List<Object[]> getCategoryQuantitiesBySchool(@Param("schoolId") UUID schoolId,
                                                @Param("excludeStatus") SchoolOrderStatus excludeStatus);

    @Query("SELECT item.category, item.sizeLabel, COALESCE(SUM(item.quantity), 0) " +
           "FROM StudentOrderItem item " +
           "WHERE item.order.school.id = :schoolId " +
           "AND item.order.status != :excludeStatus " +
           "GROUP BY item.category, item.sizeLabel " +
           "ORDER BY item.category, item.sizeLabel")
    List<Object[]> getCategorySizeQuantitiesBySchool(@Param("schoolId") UUID schoolId,
                                                    @Param("excludeStatus") SchoolOrderStatus excludeStatus);

    @Query("SELECT item.order.student.gradeClass, item.category, item.sizeLabel, COALESCE(SUM(item.quantity), 0) " +
           "FROM StudentOrderItem item " +
           "WHERE item.order.school.id = :schoolId " +
           "AND item.order.status != :excludeStatus " +
           "GROUP BY item.order.student.gradeClass, item.category, item.sizeLabel " +
           "ORDER BY item.order.student.gradeClass, item.category, item.sizeLabel")
    List<Object[]> getClassWiseCategorySizeQuantitiesBySchool(@Param("schoolId") UUID schoolId,
                                                             @Param("excludeStatus") SchoolOrderStatus excludeStatus);
}
