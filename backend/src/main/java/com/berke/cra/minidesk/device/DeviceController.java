package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.common.ApiResponse;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping("/api/customers/{customerId}/devices")
    public ResponseEntity<ApiResponse<DeviceResponse>> createDevice(
            @PathVariable Long customerId,
            @Valid @RequestBody CreateDeviceRequest request) {
        DeviceResponse device = deviceService.createDevice(customerId, request);
        ApiResponse<DeviceResponse> response = new ApiResponse<>(
                true,
                "Device created successfully",
                device
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/customers/{customerId}/devices")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getDevicesByCustomerId(
            @PathVariable Long customerId) {
        List<DeviceResponse> devices = deviceService.getDevicesByCustomerId(customerId);
        ApiResponse<List<DeviceResponse>> response = new ApiResponse<>(
                true,
                "Devices retrieved successfully",
                devices
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/devices/{id}")
    public ResponseEntity<ApiResponse<DeviceResponse>> getDeviceById(@PathVariable Long id) {
        DeviceResponse device = deviceService.getDeviceById(id);
        ApiResponse<DeviceResponse> response = new ApiResponse<>(
                true,
                "Device retrieved successfully",
                device
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/devices/{id}")
    public ResponseEntity<ApiResponse<DeviceResponse>> updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeviceRequest request) {
        DeviceResponse device = deviceService.updateDevice(id, request);
        ApiResponse<DeviceResponse> response = new ApiResponse<>(
                true,
                "Device updated successfully",
                device
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/devices/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}
