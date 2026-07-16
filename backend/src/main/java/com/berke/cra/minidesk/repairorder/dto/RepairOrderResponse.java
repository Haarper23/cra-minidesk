package com.berke.cra.minidesk.repairorder.dto;

import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;

import java.math.BigDecimal;
import java.time.Instant;

public record RepairOrderResponse(
    Long id,
    String orderNumber,
    Long deviceId,
    String deviceBrand,
    String deviceModel,
    Long customerId,
    String customerFullName,
    String reportedIssue,
    String diagnosisNotes,
    String technicianNotes,
    RepairOrderStatus status,
    RepairPriority priority,
    BigDecimal estimatedCost,
    BigDecimal finalCost,
    Instant receivedAt,
    Instant completedAt,
    Instant deliveredAt,
    Instant createdAt,
    Instant updatedAt
) {
}
