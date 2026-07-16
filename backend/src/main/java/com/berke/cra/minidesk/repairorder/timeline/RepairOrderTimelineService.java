package com.berke.cra.minidesk.repairorder.timeline;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.repairorder.RepairOrder;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.timeline.dto.RepairOrderTimelineResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RepairOrderTimelineService {

    private final RepairOrderTimelineRepository repairOrderTimelineRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final RepairOrderTimelineMapper repairOrderTimelineMapper;

    public RepairOrderTimelineService(RepairOrderTimelineRepository repairOrderTimelineRepository,
                                       RepairOrderRepository repairOrderRepository,
                                       RepairOrderTimelineMapper repairOrderTimelineMapper) {
        this.repairOrderTimelineRepository = repairOrderTimelineRepository;
        this.repairOrderRepository = repairOrderRepository;
        this.repairOrderTimelineMapper = repairOrderTimelineMapper;
    }

    @Transactional
    public void recordRepairOrderCreated(RepairOrder repairOrder) {
        RepairOrderTimelineEvent event = new RepairOrderTimelineEvent(
            repairOrder,
            RepairOrderTimelineEventType.REPAIR_ORDER_CREATED,
            null,
            repairOrder.getStatus(),
            "Repair order created with status RECEIVED",
            null
        );
        repairOrderTimelineRepository.save(event);
    }

    @Transactional
    public void recordRepairDetailsUpdated(RepairOrder repairOrder, String metadata) {
        RepairOrderTimelineEvent event = new RepairOrderTimelineEvent(
            repairOrder,
            RepairOrderTimelineEventType.REPAIR_DETAILS_UPDATED,
            null,
            null,
            "Repair order details updated",
            metadata
        );
        repairOrderTimelineRepository.save(event);
    }

    @Transactional
    public void recordStatusChanged(RepairOrder repairOrder, RepairOrderStatus previousStatus, RepairOrderStatus newStatus) {
        RepairOrderTimelineEvent event = new RepairOrderTimelineEvent(
            repairOrder,
            RepairOrderTimelineEventType.STATUS_CHANGED,
            previousStatus,
            newStatus,
            "Repair order status changed from " + previousStatus + " to " + newStatus,
            null
        );
        repairOrderTimelineRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<RepairOrderTimelineResponse> getTimelineByRepairOrderId(Long repairOrderId) {
        if (!repairOrderRepository.existsById(repairOrderId)) {
            throw new ResourceNotFoundException("Repair order with ID " + repairOrderId + " not found");
        }
        return repairOrderTimelineRepository.findByRepairOrderIdOrderByCreatedAtAscIdAsc(repairOrderId).stream()
                .map(repairOrderTimelineMapper::toResponse)
                .toList();
    }
}
