package com.berke.cra.minidesk.dashboard.dto;

import com.berke.cra.minidesk.repairorder.RepairOrderStatus;

public record RepairStatusCountResponse(
    RepairOrderStatus status,
    long count
) {
}
