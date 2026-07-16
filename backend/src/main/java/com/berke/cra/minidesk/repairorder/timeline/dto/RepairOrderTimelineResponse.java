package com.berke.cra.minidesk.repairorder.timeline.dto;

import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.timeline.RepairOrderTimelineEventType;

import java.time.Instant;

public record RepairOrderTimelineResponse(
    Long id,
    Long repairOrderId,
    RepairOrderTimelineEventType eventType,
    RepairOrderStatus previousStatus,
    RepairOrderStatus newStatus,
    String description,
    String metadata,
    Instant createdAt
) {
}
