package com.berke.cra.minidesk.repairorder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {

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

    long countByCompletedAtGreaterThanEqualAndCompletedAtLessThan(
        Instant start,
        Instant end
    );

    long countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(
        Instant start,
        Instant end
    );
}
