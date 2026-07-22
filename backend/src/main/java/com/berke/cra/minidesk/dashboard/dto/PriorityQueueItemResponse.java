package com.berke.cra.minidesk.dashboard.dto;

import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;

import java.time.Instant;

public record PriorityQueueItemResponse(
    Long id,
    String orderNumber,
    String customerName,
    String deviceLabel,
    RepairOrderStatus status,
    RepairPriority priority,
    Instant createdAt,
    long ageInDays
) {
}
