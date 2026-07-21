package com.berke.cra.minidesk.repairorder.dto;

import com.berke.cra.minidesk.repairorder.RepairPriority;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateRepairOrderRequest(
    @Positive(message = "Customer ID must be positive")
    Long customerId,

    @NotNull(message = "Device ID is required")
    @Positive(message = "Device ID must be positive")
    Long deviceId,

    @NotBlank(message = "Reported issue is required")
    @Size(max = 2000, message = "Reported issue cannot exceed 2000 characters")
    String reportedIssue,

    @NotNull(message = "Priority is required")
    RepairPriority priority,

    @Size(max = 4000, message = "Diagnosis notes cannot exceed 4000 characters")
    String diagnosisNotes,

    @Size(max = 4000, message = "Technician notes cannot exceed 4000 characters")
    String technicianNotes,

    @DecimalMin(value = "0.00", message = "Estimated cost cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Estimated cost must be a valid monetary amount")
    BigDecimal estimatedCost
) {
}
