package com.berke.cra.minidesk.repairorder.timeline;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface RepairOrderTimelineRepository extends JpaRepository<RepairOrderTimelineEvent, Long> {

    List<RepairOrderTimelineEvent> findByRepairOrderIdOrderByCreatedAtAscIdAsc(Long repairOrderId);

    long countByRepairOrderId(Long repairOrderId);

    @Query("SELECT t FROM RepairOrderTimelineEvent t JOIN FETCH t.repairOrder ro ORDER BY t.createdAt DESC, t.id DESC")
    List<RepairOrderTimelineEvent> findRecentActivity(Pageable pageable);

    @Query("SELECT COUNT(t) FROM RepairOrderTimelineEvent t WHERE t.newStatus = com.berke.cra.minidesk.repairorder.RepairOrderStatus.DELIVERED AND t.createdAt >= :start AND t.createdAt < :end")
    long countDeliveredEventsBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT t.repairOrder.id, t.createdAt FROM RepairOrderTimelineEvent t WHERE t.newStatus = com.berke.cra.minidesk.repairorder.RepairOrderStatus.READY_FOR_DELIVERY ORDER BY t.createdAt DESC")
    List<Object[]> findReadyForDeliveryTimestamps();
}
