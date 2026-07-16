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
    public ResponseEntity<ApiResponse<List<RepairOrderResponse>>> getAllRepairOrders(
            @RequestParam(value = "status", required = false) RepairOrderStatus status) {
        List<RepairOrderResponse> orders;
        if (status != null) {
            orders = repairOrderService.getRepairOrdersByStatus(status);
        } else {
            orders = repairOrderService.getAllRepairOrders();
        }
        ApiResponse<List<RepairOrderResponse>> response = new ApiResponse<>(
                true,
                "Repair orders retrieved successfully",
                orders
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
    public ResponseEntity<ApiResponse<List<RepairOrderResponse>>> getRepairOrdersByDeviceId(
            @PathVariable Long deviceId) {
        List<RepairOrderResponse> orders = repairOrderService.getRepairOrdersByDeviceId(deviceId);
        ApiResponse<List<RepairOrderResponse>> response = new ApiResponse<>(
                true,
                "Repair orders retrieved successfully",
                orders
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
