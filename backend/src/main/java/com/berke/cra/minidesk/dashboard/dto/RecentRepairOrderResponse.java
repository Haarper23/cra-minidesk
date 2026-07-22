package com.berke.cra.minidesk.dashboard.dto;

import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;

import java.time.Instant;

public record RecentRepairOrderResponse(
    Long id,
    String orderNumber,
    Long customerId,
    String customerName,
    Long deviceId,
    String deviceLabel,
    RepairOrderStatus status,
    RepairPriority priority,
    Instant createdAt,
    Instant updatedAt
) {
}
