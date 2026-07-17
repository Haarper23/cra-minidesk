package com.berke.cra.minidesk.repairorder;

import com.berke.cra.minidesk.common.ApiResponse;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RepairOrderController {

    private final RepairOrderService repairOrderService;

    public RepairOrderController(RepairOrderService repairOrderService) {
        this.repairOrderService = repairOrderService;
    }

    @PostMapping("/api/repair-orders")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> createRepairOrder(
            @Valid @RequestBody CreateRepairOrderRequest request) {
        RepairOrderResponse order = repairOrderService.createRepairOrder(request);
        ApiResponse<RepairOrderResponse> response = new ApiResponse<>(
                true,
                "Repair order created successfully",
                order
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/repair-orders")
    public ResponseEntity<ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse>>> getAllRepairOrders(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "status", required = false) RepairOrderStatus status,
            @RequestParam(value = "priority", required = false) RepairPriority priority,
            @RequestParam(value = "customerId", required = false) Long customerId,
            @RequestParam(value = "deviceId", required = false) Long deviceId,
            @RequestParam(value = "createdFrom", required = false) java.time.Instant createdFrom,
            @RequestParam(value = "createdTo", required = false) java.time.Instant createdTo,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "desc") String sortDirection) {

        com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> pageResponse = repairOrderService.searchRepairOrders(
            query, status, priority, customerId, deviceId, createdFrom, createdTo, page, size, sortBy, sortDirection
        );
        ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse>> response = new ApiResponse<>(
            true,
            "Repair orders retrieved successfully",
            pageResponse
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/repair-orders/{id}")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> getRepairOrderById(
            @PathVariable Long id) {
        RepairOrderResponse order = repairOrderService.getRepairOrderById(id);
        ApiResponse<RepairOrderResponse> response = new ApiResponse<>(
                true,
                "Repair order retrieved successfully",
                order
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/repair-orders/order-number/{orderNumber}")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> getRepairOrderByOrderNumber(
            @PathVariable String orderNumber) {
        RepairOrderResponse order = repairOrderService.getRepairOrderByOrderNumber(orderNumber);
        ApiResponse<RepairOrderResponse> response = new ApiResponse<>(
                true,
                "Repair order retrieved successfully",
                order
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/devices/{deviceId}/repair-orders")
    public ResponseEntity<ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse>>> getRepairOrdersByDeviceId(
            @PathVariable Long deviceId,
            @RequestParam(value = "status", required = false) RepairOrderStatus status,
            @RequestParam(value = "priority", required = false) RepairPriority priority,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "desc") String sortDirection) {

        com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> pageResponse = repairOrderService.searchRepairOrdersByDevice(
            deviceId, status, priority, page, size, sortBy, sortDirection
        );
        ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse>> response = new ApiResponse<>(
            true,
            "Repair orders retrieved successfully",
            pageResponse
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/repair-orders/{id}")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> updateRepairOrder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRepairOrderRequest request) {
        RepairOrderResponse order = repairOrderService.updateRepairOrder(id, request);
        ApiResponse<RepairOrderResponse> response = new ApiResponse<>(
                true,
                "Repair order updated successfully",
                order
        );
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/repair-orders/{id}/status")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> updateRepairOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRepairOrderStatusRequest request) {
        RepairOrderResponse order = repairOrderService.updateRepairOrderStatus(id, request);
        ApiResponse<RepairOrderResponse> response = new ApiResponse<>(
                true,
                "Repair order status updated successfully",
                order
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/repair-orders/{id}")
    public ResponseEntity<Void> deleteRepairOrder(@PathVariable Long id) {
        repairOrderService.deleteRepairOrder(id);
        return ResponseEntity.noContent().build();
    }
}
