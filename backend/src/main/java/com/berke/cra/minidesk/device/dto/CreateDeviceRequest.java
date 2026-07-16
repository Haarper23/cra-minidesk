package com.berke.cra.minidesk.device.dto;

import com.berke.cra.minidesk.device.DeviceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDeviceRequest(
    @NotBlank(message = "Brand is required")
    @Size(max = 80, message = "Brand cannot exceed 80 characters")
    String brand,

    @NotBlank(message = "Model is required")
    @Size(max = 120, message = "Model cannot exceed 120 characters")
    String model,

    @Size(max = 120, message = "Serial number cannot exceed 120 characters")
    String serialNumber,

    @NotNull(message = "Device type is required")
    DeviceType deviceType,

    @Size(max = 60, message = "Color cannot exceed 60 characters")
    String color,

    @Size(max = 500, message = "Accessories cannot exceed 500 characters")
    String accessories,

    @Size(max = 1000, message = "Condition notes cannot exceed 1000 characters")
    String conditionNotes
) {
}
