package com.berke.cra.minidesk.repairorder;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.device.Device;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderStatusRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.berke.cra.minidesk.repairorder.timeline.RepairOrderTimelineService;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class RepairOrderService {

    private final RepairOrderRepository repairOrderRepository;
    private final DeviceRepository deviceRepository;
    private final RepairOrderMapper repairOrderMapper;
    private final RepairOrderTimelineService repairOrderTimelineService;
    private final ObjectMapper objectMapper;

    public RepairOrderService(RepairOrderRepository repairOrderRepository,
                              DeviceRepository deviceRepository,
                              RepairOrderMapper repairOrderMapper,
                              RepairOrderTimelineService repairOrderTimelineService,
                              ObjectMapper objectMapper) {
        this.repairOrderRepository = repairOrderRepository;
        this.deviceRepository = deviceRepository;
        this.repairOrderMapper = repairOrderMapper;
        this.repairOrderTimelineService = repairOrderTimelineService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RepairOrderResponse createRepairOrder(CreateRepairOrderRequest request) {
        Device device = deviceRepository.findById(request.deviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + request.deviceId() + " not found"));

        if (request.customerId() != null && !device.getCustomer().getId().equals(request.customerId())) {
            throw new IllegalArgumentException("Device with ID " + request.deviceId() + " does not belong to customer with ID " + request.customerId());
        }

        if (request.estimatedCost() != null && request.estimatedCost().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Estimated cost cannot be negative");
        }

        String orderNumber = generateUniqueOrderNumber();
        RepairOrder order = repairOrderMapper.toEntity(request, device, orderNumber);
        RepairOrder saved = repairOrderRepository.save(order);
        repairOrderTimelineService.recordRepairOrderCreated(saved);
        return repairOrderMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public RepairOrderResponse getRepairOrderById(Long id) {
        RepairOrder order = repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order with ID " + id + " not found"));
        return repairOrderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public RepairOrderResponse getRepairOrderByOrderNumber(String orderNumber) {
        RepairOrder order = repairOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order with order number " + orderNumber + " not found"));
        return repairOrderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> searchRepairOrders(
            String query,
            RepairOrderStatus status,
            RepairPriority priority,
            Long customerId,
            Long deviceId,
            Instant createdFrom,
            Instant createdTo,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        if (createdFrom != null && createdTo != null && !createdFrom.isBefore(createdTo)) {
            throw new IllegalArgumentException("createdFrom must be before createdTo");
        }

        java.util.Set<String> allowedFields = java.util.Set.of(
            "id", "orderNumber", "status", "priority", "receivedAt", "completedAt", "deliveredAt", "createdAt", "updatedAt"
        );
        org.springframework.data.domain.Pageable pageable = com.berke.cra.minidesk.common.pagination.PaginationUtils.createPageable(
            page, size, sortBy, sortDirection, allowedFields
        );

        org.springframework.data.jpa.domain.Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
            query, status, priority, customerId, deviceId, createdFrom, createdTo
        );

        org.springframework.data.domain.Page<RepairOrder> orderPage = repairOrderRepository.findAll(spec, pageable);

        return com.berke.cra.minidesk.common.pagination.PageResponse.fromPage(orderPage, repairOrderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> searchRepairOrdersByDevice(
            Long deviceId,
            RepairOrderStatus status,
            RepairPriority priority,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        if (!deviceRepository.existsById(deviceId)) {
            throw new ResourceNotFoundException("Device with ID " + deviceId + " not found");
        }

        java.util.Set<String> allowedFields = java.util.Set.of(
            "id", "orderNumber", "status", "priority", "receivedAt", "completedAt", "deliveredAt", "createdAt", "updatedAt"
        );
        org.springframework.data.domain.Pageable pageable = com.berke.cra.minidesk.common.pagination.PaginationUtils.createPageable(
            page, size, sortBy, sortDirection, allowedFields
        );

        org.springframework.data.jpa.domain.Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
            null, status, priority, null, deviceId, null, null
        );

        org.springframework.data.domain.Page<RepairOrder> orderPage = repairOrderRepository.findAll(spec, pageable);

        return com.berke.cra.minidesk.common.pagination.PageResponse.fromPage(orderPage, repairOrderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> searchRepairOrdersByCustomerAndDevice(
            Long customerId,
            Long deviceId,
            RepairOrderStatus status,
            RepairPriority priority,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + deviceId + " not found"));

        if (!device.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Device with ID " + deviceId + " does not belong to customer with ID " + customerId);
        }

        return searchRepairOrdersByDevice(deviceId, status, priority, page, size, sortBy, sortDirection);
    }

    @Transactional
    public RepairOrderResponse updateRepairOrder(Long id, UpdateRepairOrderRequest request) {
        RepairOrder order = repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order with ID " + id + " not found"));

        if (request.estimatedCost() != null && request.estimatedCost().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Estimated cost cannot be negative");
        }
        if (request.finalCost() != null && request.finalCost().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Final cost cannot be negative");
        }

        List<String> changedFields = new java.util.ArrayList<>();
        if (isStringChanged(order.getReportedIssue(), request.reportedIssue())) {
            changedFields.add("reportedIssue");
        }
        if (isPriorityChanged(order.getPriority(), request.priority())) {
            changedFields.add("priority");
        }
        if (isStringChanged(order.getDiagnosisNotes(), request.diagnosisNotes())) {
            changedFields.add("diagnosisNotes");
        }
        if (isStringChanged(order.getTechnicianNotes(), request.technicianNotes())) {
            changedFields.add("technicianNotes");
        }
        if (isBigDecimalChanged(order.getEstimatedCost(), request.estimatedCost())) {
            changedFields.add("estimatedCost");
        }
        if (isBigDecimalChanged(order.getFinalCost(), request.finalCost())) {
            changedFields.add("finalCost");
        }

        repairOrderMapper.updateEntity(order, request);
        RepairOrder updated = repairOrderRepository.save(order);

        if (!changedFields.isEmpty()) {
            String metadata = serializeMetadata(changedFields);
            repairOrderTimelineService.recordRepairDetailsUpdated(updated, metadata);
        }

        return repairOrderMapper.toResponse(updated);
    }

    @Transactional
    public RepairOrderResponse updateRepairOrderStatus(Long id, UpdateRepairOrderStatusRequest request) {
        RepairOrder order = repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order with ID " + id + " not found"));

        RepairOrderStatus currentStatus = order.getStatus();
        RepairOrderStatus newStatus = request.status();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);

        if (newStatus == RepairOrderStatus.COMPLETED && order.getCompletedAt() == null) {
            order.setCompletedAt(Instant.now());
        }
        if (newStatus == RepairOrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(Instant.now());
        }

        RepairOrder updated = repairOrderRepository.save(order);
        repairOrderTimelineService.recordStatusChanged(updated, currentStatus, newStatus);
        return repairOrderMapper.toResponse(updated);
    }

    @Transactional
    public void deleteRepairOrder(Long id) {
        RepairOrder order = repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order with ID " + id + " not found"));

        RepairOrderStatus status = order.getStatus();
        if (status != RepairOrderStatus.RECEIVED && status != RepairOrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot delete repair order in status " + status + ". Only records in RECEIVED or CANCELLED status can be deleted.");
        }
        repairOrderRepository.delete(order);
    }

    private String generateUniqueOrderNumber() {
        LocalDate localDate = LocalDate.now(ZoneOffset.UTC);
        String datePart = localDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        for (int i = 0; i < 5; i++) {
            String token = UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(java.util.Locale.ROOT);
            String candidate = "CRA-" + datePart + "-" + token;
            if (!repairOrderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Failed to generate a unique order number after 5 attempts");
    }

    private boolean isValidTransition(RepairOrderStatus from, RepairOrderStatus to) {
        if (from == to) {
            return false;
        }
        return switch (from) {
            case RECEIVED -> to == RepairOrderStatus.DIAGNOSING || to == RepairOrderStatus.CANCELLED;
            case DIAGNOSING -> to == RepairOrderStatus.WAITING_FOR_CUSTOMER_APPROVAL || to == RepairOrderStatus.IN_REPAIR || to == RepairOrderStatus.CANCELLED;
            case WAITING_FOR_CUSTOMER_APPROVAL -> to == RepairOrderStatus.APPROVED || to == RepairOrderStatus.CANCELLED;
            case APPROVED -> to == RepairOrderStatus.IN_REPAIR || to == RepairOrderStatus.CANCELLED;
            case IN_REPAIR -> to == RepairOrderStatus.WAITING_FOR_PART || to == RepairOrderStatus.COMPLETED || to == RepairOrderStatus.CANCELLED;
            case WAITING_FOR_PART -> to == RepairOrderStatus.IN_REPAIR || to == RepairOrderStatus.CANCELLED;
            case COMPLETED -> to == RepairOrderStatus.READY_FOR_DELIVERY;
            case READY_FOR_DELIVERY -> to == RepairOrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private String clean(String input) {
        if (input == null) {
            return null;
        }
        String trimmed = input.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isStringChanged(String oldVal, String newVal) {
        String cleanOld = clean(oldVal);
        String cleanNew = clean(newVal);
        if (cleanOld == null && cleanNew == null) {
            return false;
        }
        if (cleanOld == null || cleanNew == null) {
            return true;
        }
        return !cleanOld.equals(cleanNew);
    }

    private boolean isPriorityChanged(RepairPriority oldVal, RepairPriority newVal) {
        if (oldVal == null && newVal == null) {
            return false;
        }
        if (oldVal == null || newVal == null) {
            return true;
        }
        return oldVal != newVal;
    }

    private boolean isBigDecimalChanged(java.math.BigDecimal oldVal, java.math.BigDecimal newVal) {
        if (oldVal == null && newVal == null) {
            return false;
        }
        if (oldVal == null || newVal == null) {
            return true;
        }
        return oldVal.compareTo(newVal) != 0;
    }

    private String serializeMetadata(List<String> changedFields) {
        try {
            java.util.Collections.sort(changedFields);
            record ChangedFieldsMetadata(List<String> changedFields) {}
            return objectMapper.writeValueAsString(new ChangedFieldsMetadata(changedFields));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize changed fields metadata", e);
        }
    }
}
