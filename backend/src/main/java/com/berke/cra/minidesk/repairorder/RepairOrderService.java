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

    public RepairOrderService(RepairOrderRepository repairOrderRepository,
                              DeviceRepository deviceRepository,
                              RepairOrderMapper repairOrderMapper) {
        this.repairOrderRepository = repairOrderRepository;
        this.deviceRepository = deviceRepository;
        this.repairOrderMapper = repairOrderMapper;
    }

    @Transactional
    public RepairOrderResponse createRepairOrder(CreateRepairOrderRequest request) {
        Device device = deviceRepository.findById(request.deviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + request.deviceId() + " not found"));

        if (request.estimatedCost() != null && request.estimatedCost().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Estimated cost cannot be negative");
        }

        String orderNumber = generateUniqueOrderNumber();
        RepairOrder order = repairOrderMapper.toEntity(request, device, orderNumber);
        RepairOrder saved = repairOrderRepository.save(order);
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
    public List<RepairOrderResponse> getAllRepairOrders() {
        return repairOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(repairOrderMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepairOrderResponse> getRepairOrdersByDeviceId(Long deviceId) {
        if (!deviceRepository.existsById(deviceId)) {
            throw new ResourceNotFoundException("Device with ID " + deviceId + " not found");
        }
        return repairOrderRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId).stream()
                .map(repairOrderMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepairOrderResponse> getRepairOrdersByStatus(RepairOrderStatus status) {
        return repairOrderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(repairOrderMapper::toResponse)
                .toList();
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

        repairOrderMapper.updateEntity(order, request);
        RepairOrder updated = repairOrderRepository.save(order);
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
                    .toUpperCase();
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
}
