package com.berke.cra.minidesk.repairorder;

import com.berke.cra.minidesk.device.Device;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class RepairOrderMapper {

    public RepairOrder toEntity(CreateRepairOrderRequest request, Device device, String orderNumber) {
        if (request == null) {
            return null;
        }

        return new RepairOrder(
            orderNumber,
            device,
            clean(request.reportedIssue()),
            clean(request.diagnosisNotes()),
            clean(request.technicianNotes()),
            RepairOrderStatus.RECEIVED,
            request.priority(),
            request.estimatedCost(),
            null, // finalCost defaults to null
            java.time.Instant.now() // receivedAt defaults to current Instant
        );
    }

    public RepairOrderResponse toResponse(RepairOrder order) {
        if (order == null) {
            return null;
        }

        Device device = order.getDevice();
        Long deviceId = null;
        String deviceBrand = null;
        String deviceModel = null;
        Long customerId = null;
        String customerFullName = null;

        if (device != null) {
            deviceId = device.getId();
            deviceBrand = device.getBrand();
            deviceModel = device.getModel();
            if (device.getCustomer() != null) {
                customerId = device.getCustomer().getId();
                customerFullName = device.getCustomer().getFullName();
            }
        }

        return new RepairOrderResponse(
            order.getId(),
            order.getOrderNumber(),
            deviceId,
            deviceBrand,
            deviceModel,
            customerId,
            customerFullName,
            order.getReportedIssue(),
            order.getDiagnosisNotes(),
            order.getTechnicianNotes(),
            order.getStatus(),
            order.getPriority(),
            order.getEstimatedCost(),
            order.getFinalCost(),
            order.getReceivedAt(),
            order.getCompletedAt(),
            order.getDeliveredAt(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    public void updateEntity(RepairOrder order, UpdateRepairOrderRequest request) {
        if (order == null || request == null) {
            return;
        }

        order.setReportedIssue(clean(request.reportedIssue()));
        order.setPriority(request.priority());
        order.setDiagnosisNotes(clean(request.diagnosisNotes()));
        order.setTechnicianNotes(clean(request.technicianNotes()));
        order.setEstimatedCost(request.estimatedCost());
        order.setFinalCost(request.finalCost());
    }

    private String clean(String input) {
        if (input == null) {
            return null;
        }
        String trimmed = input.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
