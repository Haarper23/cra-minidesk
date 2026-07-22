package com.berke.cra.minidesk.repairorder;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long>, JpaSpecificationExecutor<RepairOrder> {

    boolean existsByOrderNumber(String orderNumber);

    List<RepairOrder> findByDeviceIdOrderByCreatedAtDesc(Long deviceId);

    List<RepairOrder> findByStatusOrderByCreatedAtDesc(RepairOrderStatus status);

    List<RepairOrder> findAllByOrderByCreatedAtDesc();

    Optional<RepairOrder> findByOrderNumber(String orderNumber);

    boolean existsByDeviceId(Long deviceId);

    long countByStatus(RepairOrderStatus status);

    long countByStatusNotIn(Collection<RepairOrderStatus> statuses);

    long countByPriorityAndStatusNotIn(
        RepairPriority priority,
        Collection<RepairOrderStatus> statuses
    );

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
        Instant start,
        Instant end
    );

    long countByCompletedAtGreaterThanEqualAndCompletedAtLessThan(
        Instant start,
        Instant end
    );

    long countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(
        Instant start,
        Instant end
    );

    @Query("SELECT ro.status, COUNT(ro.id) FROM RepairOrder ro GROUP BY ro.status")
    List<Object[]> countGroupedByStatus();

    @Query("SELECT ro FROM RepairOrder ro JOIN FETCH ro.device d JOIN FETCH d.customer c ORDER BY ro.createdAt DESC, ro.id DESC")
    List<RepairOrder> findRecentRepairOrders(Pageable pageable);

    @Query("SELECT ro FROM RepairOrder ro JOIN FETCH ro.device d JOIN FETCH d.customer c WHERE ro.status NOT IN :inactiveStatuses AND ro.priority IN :priorities ORDER BY CASE WHEN ro.priority = com.berke.cra.minidesk.repairorder.RepairPriority.URGENT THEN 1 WHEN ro.priority = com.berke.cra.minidesk.repairorder.RepairPriority.HIGH THEN 2 ELSE 3 END ASC, ro.createdAt ASC, ro.id ASC")
    List<RepairOrder> findPriorityQueue(
        @Param("inactiveStatuses") Collection<RepairOrderStatus> inactiveStatuses,
        @Param("priorities") Collection<RepairPriority> priorities,
        Pageable pageable
    );

    @Query("SELECT ro FROM RepairOrder ro JOIN FETCH ro.device d JOIN FETCH d.customer c WHERE ro.status = :status ORDER BY ro.updatedAt ASC, ro.id ASC")
    List<RepairOrder> findReadyForDeliveryQueue(
        @Param("status") RepairOrderStatus status,
        Pageable pageable
    );
}
