package com.berke.cra.minidesk.repairorder.timeline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairOrderTimelineRepository extends JpaRepository<RepairOrderTimelineEvent, Long> {

    List<RepairOrderTimelineEvent> findByRepairOrderIdOrderByCreatedAtAscIdAsc(Long repairOrderId);

    long countByRepairOrderId(Long repairOrderId);
}
