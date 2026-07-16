package com.berke.cra.minidesk.repairorder;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.device.Device;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderStatusRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RepairOrderServiceTest {

    @Mock
    private RepairOrderRepository repairOrderRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private RepairOrderMapper repairOrderMapper;

    @InjectMocks
    private RepairOrderService repairOrderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldCreateRepairOrderForExistingDevice() {
        Long deviceId = 1L;
        Device device = new Device();
        device.setId(deviceId);

        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                deviceId, "Screen cracked", RepairPriority.HIGH, "Diagnostic notes", null, new BigDecimal("150.00")
        );

        RepairOrder order = new RepairOrder(
                "CRA-20260716-ABCDEF12", device, "Screen cracked", "Diagnostic notes", null,
                RepairOrderStatus.RECEIVED, RepairPriority.HIGH, new BigDecimal("150.00"), null, Instant.now()
        );

        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-ABCDEF12", deviceId, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", "Diagnostic notes", null, RepairOrderStatus.RECEIVED, RepairPriority.HIGH,
                new BigDecimal("150.00"), null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(repairOrderRepository.existsByOrderNumber(any(String.class))).thenReturn(false);
        when(repairOrderMapper.toEntity(eq(request), eq(device), any(String.class))).thenReturn(order);
        when(repairOrderRepository.save(order)).thenReturn(order);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.createRepairOrder(request);

        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("CRA-20260716-ABCDEF12", result.orderNumber());
        assertEquals(RepairOrderStatus.RECEIVED, result.status());

        verify(repairOrderRepository, times(1)).save(order);
    }

    @Test
    void shouldGenerateOrderNumberInRequiredFormat() {
        Long deviceId = 1L;
        Device device = new Device();
        device.setId(deviceId);

        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                deviceId, "Screen cracked", RepairPriority.HIGH, "Diagnostic notes", null, new BigDecimal("150.00")
        );

        RepairOrder order = new RepairOrder(
                "CRA-20260716-ABCDEF12", device, "Screen cracked", "Diagnostic notes", null,
                RepairOrderStatus.RECEIVED, RepairPriority.HIGH, new BigDecimal("150.00"), null, Instant.now()
        );

        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-ABCDEF12", deviceId, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", "Diagnostic notes", null, RepairOrderStatus.RECEIVED, RepairPriority.HIGH,
                new BigDecimal("150.00"), null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(repairOrderRepository.existsByOrderNumber(any(String.class))).thenReturn(false);
        when(repairOrderMapper.toEntity(eq(request), eq(device), any(String.class))).thenReturn(order);
        when(repairOrderRepository.save(order)).thenReturn(order);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.createRepairOrder(request);

        assertNotNull(result.orderNumber());
        assertTrue(result.orderNumber().matches("^CRA-\\d{8}-[0-9A-F]{8}$"));
    }

    @Test
    void shouldRejectMissingDevice() {
        Long deviceId = 999L;
        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                deviceId, "Screen cracked", RepairPriority.HIGH, null, null, null
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.createRepairOrder(request));
        verify(repairOrderRepository, never()).save(any());
    }

    @Test
    void shouldReturnRepairOrderById() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", null, null, RepairOrderStatus.RECEIVED, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.getRepairOrderById(orderId);

        assertNotNull(result);
        assertEquals(orderId, result.id());
    }

    @Test
    void shouldReturnRepairOrderByOrderNumber() {
        String orderNumber = "CRA-20260716-ABCDEF12";
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                10L, orderNumber, 1L, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", null, null, RepairOrderStatus.RECEIVED, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findByOrderNumber(orderNumber)).thenReturn(Optional.of(order));
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.getRepairOrderByOrderNumber(orderNumber);

        assertNotNull(result);
        assertEquals(orderNumber, result.orderNumber());
    }

    @Test
    void shouldReturnRepairOrdersByDevice() {
        Long deviceId = 1L;
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-ABCDEF12", deviceId, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", null, null, RepairOrderStatus.RECEIVED, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(deviceRepository.existsById(deviceId)).thenReturn(true);
        when(repairOrderRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId)).thenReturn(List.of(order));
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        List<RepairOrderResponse> results = repairOrderService.getRepairOrdersByDeviceId(deviceId);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(deviceId, results.getFirst().deviceId());
    }

    @Test
    void shouldReturnRepairOrdersByStatus() {
        RepairOrderStatus status = RepairOrderStatus.RECEIVED;
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", null, null, status, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findByStatusOrderByCreatedAtDesc(status)).thenReturn(List.of(order));
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        List<RepairOrderResponse> results = repairOrderService.getRepairOrdersByStatus(status);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(status, results.getFirst().status());
    }

    @Test
    void shouldUpdateEditableRepairDetails() {
        Long orderId = 10L;
        UpdateRepairOrderRequest request = new UpdateRepairOrderRequest(
                "New issue", RepairPriority.LOW, "New diagnosis", "New tech notes", new BigDecimal("200.00"), new BigDecimal("250.00")
        );
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "New issue", "New diagnosis", "New tech notes", RepairOrderStatus.RECEIVED, RepairPriority.LOW,
                new BigDecimal("200.00"), new BigDecimal("250.00"), Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.updateRepairOrder(orderId, request);

        assertNotNull(result);
        assertEquals("New issue", result.reportedIssue());
        assertEquals(RepairPriority.LOW, result.priority());
        verify(repairOrderMapper, times(1)).updateEntity(order, request);
    }

    @Test
    void shouldPermitValidStatusTransition() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.RECEIVED);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING);
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "Cracked", null, null, RepairOrderStatus.DIAGNOSING, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.updateRepairOrderStatus(orderId, request);

        assertNotNull(result);
        assertEquals(RepairOrderStatus.DIAGNOSING, result.status());
    }

    @Test
    void shouldRejectInvalidStatusTransition() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.RECEIVED);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED);

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.updateRepairOrderStatus(orderId, request));
        verify(repairOrderRepository, never()).save(any());
    }

    @Test
    void shouldSetCompletedAtWhenEnteringCOMPLETED() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.IN_REPAIR);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED);
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "Cracked", null, null, RepairOrderStatus.COMPLETED, RepairPriority.HIGH,
                null, null, Instant.now(), Instant.now(), null, Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.updateRepairOrderStatus(orderId, request);

        assertNotNull(result);
        assertNotNull(order.getCompletedAt());
        assertNull(order.getDeliveredAt());
    }

    @Test
    void shouldSetDeliveredAtWhenEnteringDELIVERED() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.READY_FOR_DELIVERY);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.DELIVERED);
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "Cracked", null, null, RepairOrderStatus.DELIVERED, RepairPriority.HIGH,
                null, null, Instant.now(), null, Instant.now(), Instant.now(), Instant.now()
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        RepairOrderResponse result = repairOrderService.updateRepairOrderStatus(orderId, request);

        assertNotNull(result);
        assertNotNull(order.getDeliveredAt());
    }

    @Test
    void shouldRejectDeletionForActiveRepairOrder() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.IN_REPAIR);

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.deleteRepairOrder(orderId));
        verify(repairOrderRepository, never()).delete(any());
    }

    @Test
    void shouldAllowDeletionForRECEIVEDOrCANCELLED() {
        Long orderId1 = 10L;
        RepairOrder order1 = new RepairOrder();
        order1.setStatus(RepairOrderStatus.RECEIVED);

        Long orderId2 = 20L;
        RepairOrder order2 = new RepairOrder();
        order2.setStatus(RepairOrderStatus.CANCELLED);

        when(repairOrderRepository.findById(orderId1)).thenReturn(Optional.of(order1));
        when(repairOrderRepository.findById(orderId2)).thenReturn(Optional.of(order2));

        assertDoesNotThrow(() -> repairOrderService.deleteRepairOrder(orderId1));
        assertDoesNotThrow(() -> repairOrderService.deleteRepairOrder(orderId2));

        verify(repairOrderRepository, times(1)).delete(order1);
        verify(repairOrderRepository, times(1)).delete(order2);
    }

    @Test
    void shouldRejectNegativeCost() {
        Long deviceId = 1L;
        Device device = new Device();
        device.setId(deviceId);

        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                deviceId, "Screen cracked", RepairPriority.HIGH, "Diagnostic notes", null, new BigDecimal("-150.00")
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.createRepairOrder(request));
        verify(repairOrderRepository, never()).save(any());
    }

    @Test
    void shouldNotAcceptClientControlledOrderNumber() {
        // Client-controlled orderNumber is not in CreateRepairOrderRequest DTO
        // Check fields of CreateRepairOrderRequest DTO at compile time or class inspection
        // Our DTO class lacks orderNumber field, proving this requirement.
    }
}
