package com.berke.cra.minidesk.device.dto;

import com.berke.cra.minidesk.device.DeviceType;
import java.time.Instant;

public record DeviceResponse(
    Long id,
    Long customerId,
    String customerFullName,
    String brand,
    String model,
    String serialNumber,
    DeviceType deviceType,
    String color,
    String accessories,
    String conditionNotes,
    Instant createdAt,
    Instant updatedAt
) {
}
