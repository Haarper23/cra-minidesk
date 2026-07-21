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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/api/devices")
    public ResponseEntity<ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse>>> getAllDevices(
            @RequestParam(value = "customerId", required = false) Long customerId,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "deviceType", required = false) DeviceType deviceType,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "desc") String sortDirection) {

        com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> pageResponse = deviceService.searchDevices(
            customerId, query, deviceType, page, size, sortBy, sortDirection
        );
        ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse>> response = new ApiResponse<>(
            true,
            "Devices retrieved successfully",
            pageResponse
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/customers/{customerId}/devices")
    public ResponseEntity<ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse>>> getDevicesByCustomerId(
            @PathVariable Long customerId,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "deviceType", required = false) DeviceType deviceType,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "desc") String sortDirection) {

        com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> pageResponse = deviceService.searchDevicesByCustomer(
            customerId, query, deviceType, page, size, sortBy, sortDirection
        );
        ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse>> response = new ApiResponse<>(
            true,
            "Devices retrieved successfully",
            pageResponse
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

    // --- Nested customer/device ownership-validated endpoints ---

    @GetMapping("/api/customers/{customerId}/devices/{deviceId}")
    public ResponseEntity<ApiResponse<DeviceResponse>> getDeviceForCustomer(
            @PathVariable Long customerId,
            @PathVariable Long deviceId) {
        DeviceResponse device = deviceService.getDeviceForCustomer(customerId, deviceId);
        ApiResponse<DeviceResponse> response = new ApiResponse<>(
                true,
                "Device retrieved successfully",
                device
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/customers/{customerId}/devices/{deviceId}")
    public ResponseEntity<ApiResponse<DeviceResponse>> updateDeviceForCustomer(
            @PathVariable Long customerId,
            @PathVariable Long deviceId,
            @Valid @RequestBody UpdateDeviceRequest request) {
        DeviceResponse device = deviceService.updateDeviceForCustomer(customerId, deviceId, request);
        ApiResponse<DeviceResponse> response = new ApiResponse<>(
                true,
                "Device updated successfully",
                device
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/customers/{customerId}/devices/{deviceId}")
    public ResponseEntity<Void> deleteDeviceForCustomer(
            @PathVariable Long customerId,
            @PathVariable Long deviceId) {
        deviceService.deleteDeviceForCustomer(customerId, deviceId);
        return ResponseEntity.noContent().build();
    }
}
