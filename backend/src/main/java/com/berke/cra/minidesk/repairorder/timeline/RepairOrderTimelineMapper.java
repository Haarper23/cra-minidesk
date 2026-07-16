package com.berke.cra.minidesk.repairorder.timeline;

import com.berke.cra.minidesk.repairorder.timeline.dto.RepairOrderTimelineResponse;
import org.springframework.stereotype.Component;

@Component
public class RepairOrderTimelineMapper {

    public RepairOrderTimelineResponse toResponse(RepairOrderTimelineEvent event) {
        if (event == null) {
            return null;
        }

        Long repairOrderId = null;
        if (event.getRepairOrder() != null) {
            repairOrderId = event.getRepairOrder().getId();
        }

        return new RepairOrderTimelineResponse(
            event.getId(),
            repairOrderId,
            event.getEventType(),
            event.getPreviousStatus(),
            event.getNewStatus(),
            event.getDescription(),
            event.getMetadata(),
            event.getCreatedAt()
        );
    }
}
