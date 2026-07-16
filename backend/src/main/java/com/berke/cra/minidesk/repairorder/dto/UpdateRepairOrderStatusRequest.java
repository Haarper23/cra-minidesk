package com.berke.cra.minidesk.repairorder.dto;

import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateRepairOrderStatusRequest(
    @NotNull(message = "Status is required")
    RepairOrderStatus status
) {
}
