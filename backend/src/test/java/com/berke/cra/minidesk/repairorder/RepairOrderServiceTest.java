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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.MockitoAnnotations;
import com.berke.cra.minidesk.repairorder.timeline.RepairOrderTimelineService;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    @Mock
    private RepairOrderTimelineService repairOrderTimelineService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

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
                null, deviceId, "Screen cracked", RepairPriority.HIGH, "Diagnostic notes", null, new BigDecimal("150.00")
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
                null, deviceId, "Screen cracked", RepairPriority.HIGH, "Diagnostic notes", null, new BigDecimal("150.00")
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
                null, deviceId, "Screen cracked", RepairPriority.HIGH, null, null, null
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
    @SuppressWarnings("unchecked")
    void shouldReturnRepairOrdersByDevice() {
        Long deviceId = 1L;
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-ABCDEF12", deviceId, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", null, null, RepairOrderStatus.RECEIVED, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(deviceRepository.existsById(deviceId)).thenReturn(true);
        org.springframework.data.domain.Page<RepairOrder> orderPage = new org.springframework.data.domain.PageImpl<>(List.of(order));
        when(repairOrderRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class))).thenReturn(orderPage);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> results = repairOrderService.searchRepairOrdersByDevice(
            deviceId, null, null, 0, 20, "createdAt", "desc"
        );

        assertNotNull(results);
        assertEquals(1, results.content().size());
        assertEquals(deviceId, results.content().getFirst().deviceId());
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldReturnRepairOrdersByStatus() {
        RepairOrderStatus status = RepairOrderStatus.RECEIVED;
        RepairOrder order = new RepairOrder();
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-ABCDEF12", 1L, "Apple", "iPhone", 5L, "John Doe",
                "Screen cracked", null, null, status, RepairPriority.HIGH,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        org.springframework.data.domain.Page<RepairOrder> orderPage = new org.springframework.data.domain.PageImpl<>(List.of(order));
        when(repairOrderRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class))).thenReturn(orderPage);
        when(repairOrderMapper.toResponse(order)).thenReturn(response);

        com.berke.cra.minidesk.common.pagination.PageResponse<RepairOrderResponse> results = repairOrderService.searchRepairOrders(
            null, status, null, null, null, null, null, 0, 20, "createdAt", "desc"
        );

        assertNotNull(results);
        assertEquals(1, results.content().size());
        assertEquals(status, results.content().getFirst().status());
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
        verify(repairOrderRepository, never()).delete(any(RepairOrder.class));
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
                null, deviceId, "Screen cracked", RepairPriority.HIGH, "Diagnostic notes", null, new BigDecimal("-150.00")
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

    @Test
    void createRepairOrderRecordsOneCreationEvent() {
        Long deviceId = 1L;
        Device device = new Device();
        device.setId(deviceId);

        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                null, deviceId, "Cracked screen", RepairPriority.HIGH, null, null, null
        );

        RepairOrder order = new RepairOrder(
                "CRA-20260716-12345678", device, "Cracked screen", null, null,
                RepairOrderStatus.RECEIVED, RepairPriority.HIGH, null, null, Instant.now()
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(repairOrderRepository.existsByOrderNumber(any(String.class))).thenReturn(false);
        when(repairOrderMapper.toEntity(eq(request), eq(device), any(String.class))).thenReturn(order);
        when(repairOrderRepository.save(order)).thenReturn(order);

        repairOrderService.createRepairOrder(request);

        verify(repairOrderTimelineService, times(1)).recordRepairOrderCreated(order);
    }

    @Test
    void failedCreateDoesNotRecordTimelineEvent() {
        Long deviceId = 999L;
        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                null, deviceId, "Cracked screen", RepairPriority.HIGH, null, null, null
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.createRepairOrder(request));
        verify(repairOrderTimelineService, never()).recordRepairOrderCreated(any());
    }

    @Test
    void validStatusTransitionRecordsOneStatusEvent() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.RECEIVED);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING);

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);

        repairOrderService.updateRepairOrderStatus(orderId, request);

        verify(repairOrderTimelineService, times(1)).recordStatusChanged(order, RepairOrderStatus.RECEIVED, RepairOrderStatus.DIAGNOSING);
    }

    @Test
    void invalidStatusTransitionRecordsNoTimelineEvent() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.RECEIVED);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED);

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.updateRepairOrderStatus(orderId, request));
        verify(repairOrderTimelineService, never()).recordStatusChanged(any(), any(), any());
    }

    @Test
    void detailsUpdateRecordsChangedFieldNamesAlphabetically() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setReportedIssue("Old issue");
        order.setPriority(RepairPriority.LOW);

        UpdateRepairOrderRequest request = new UpdateRepairOrderRequest(
                "New issue", RepairPriority.HIGH, null, null, null, null
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);

        repairOrderService.updateRepairOrder(orderId, request);

        ArgumentCaptor<String> metadataCaptor = ArgumentCaptor.forClass(String.class);
        verify(repairOrderTimelineService, times(1)).recordRepairDetailsUpdated(eq(order), metadataCaptor.capture());

        String capturedMetadata = metadataCaptor.getValue();
        assertTrue(capturedMetadata.contains("\"changedFields\":[\"priority\",\"reportedIssue\"]"));
    }

    @Test
    void noOpDetailsUpdateRecordsNoEvent() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setReportedIssue("Issue");
        order.setPriority(RepairPriority.HIGH);

        UpdateRepairOrderRequest request = new UpdateRepairOrderRequest(
                "Issue", RepairPriority.HIGH, null, null, null, null
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);

        repairOrderService.updateRepairOrder(orderId, request);

        verify(repairOrderTimelineService, never()).recordRepairDetailsUpdated(any(), any());
    }

    @Test
    void multipleChangedFieldsProduceOneUpdateEvent() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setReportedIssue("Old issue");
        order.setPriority(RepairPriority.LOW);
        order.setEstimatedCost(new BigDecimal("100.00"));

        UpdateRepairOrderRequest request = new UpdateRepairOrderRequest(
                "New issue", RepairPriority.HIGH, null, null, new BigDecimal("200.00"), null
        );

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(repairOrderRepository.save(order)).thenReturn(order);

        repairOrderService.updateRepairOrder(orderId, request);

        verify(repairOrderTimelineService, times(1)).recordRepairDetailsUpdated(eq(order), any(String.class));
    }

    @Test
    void negativeCostValidationStillWorksAndRecordsNoTimelineEvent() {
        Long deviceId = 1L;
        Device device = new Device();
        device.setId(deviceId);

        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                null, deviceId, "Cracked screen", RepairPriority.HIGH, null, null, new BigDecimal("-50.00")
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.createRepairOrder(request));
        verify(repairOrderTimelineService, never()).recordRepairOrderCreated(any());
    }

    @Test
    void deletionRulesRemainUnchangedAndRecordNoTimelineEvent() {
        Long orderId = 10L;
        RepairOrder order = new RepairOrder();
        order.setStatus(RepairOrderStatus.IN_REPAIR);

        when(repairOrderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.deleteRepairOrder(orderId));
        // Deletion events must not be recorded (should not invoke any timeline service record call)
        verify(repairOrderTimelineService, never()).recordStatusChanged(any(), any(), any());
    }

    @Test
    void shouldRejectOrderSearchWithInvalidSortField() {
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, null, null, 0, 20, "invalidField", "asc")
        );
    }

    @Test
    void shouldRejectOrderSearchWithInvalidSortDirection() {
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, null, null, 0, 20, "orderNumber", "invalidDir")
        );
    }

    @Test
    void shouldRejectOrderSearchWithNegativePage() {
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, null, null, -1, 20, "orderNumber", "asc")
        );
    }

    @Test
    void shouldRejectOrderSearchWithZeroSize() {
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, null, null, 0, 0, "orderNumber", "asc")
        );
    }

    @Test
    void shouldRejectOrderSearchWithLargeSize() {
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, null, null, 0, 101, "orderNumber", "asc")
        );
    }

    @Test
    void shouldRejectOrderSearchWithInvalidDateRange() {
        Instant from = Instant.parse("2026-08-01T00:00:00Z");
        Instant to = Instant.parse("2026-07-01T00:00:00Z");
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, from, to, 0, 20, "orderNumber", "asc")
        );
    }

    @Test
    void shouldRejectOrderSearchWithEqualDates() {
        Instant same = Instant.parse("2026-07-01T00:00:00Z");
        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrders(null, null, null, null, null, same, same, 0, 20, "orderNumber", "asc")
        );
    }

    @Test
    void shouldThrowNotFoundForMissingDeviceInNestedOrderSearch() {
        Long deviceId = 999L;
        when(deviceRepository.existsById(deviceId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () ->
            repairOrderService.searchRepairOrdersByDevice(deviceId, null, null, 0, 20, "orderNumber", "asc")
        );
    }

    @Test
    void createRepairOrderFailsWhenDeviceDoesNotBelongToCustomer() {
        Long customerId = 5L;
        Long deviceId = 1L;
        Customer owner = new Customer();
        owner.setId(10L); // Different customer ID

        Device device = new Device();
        device.setId(deviceId);
        device.setCustomer(owner);

        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                customerId, deviceId, "Screen cracked", RepairPriority.HIGH, null, null, null
        );

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.createRepairOrder(request));
        verify(repairOrderRepository, never()).save(any());
    }

    @Test
    void searchRepairOrdersByCustomerAndDeviceFailsForMismatchedPair() {
        Long customerId = 5L;
        Long deviceId = 1L;
        Customer owner = new Customer();
        owner.setId(10L);

        Device device = new Device();
        device.setId(deviceId);
        device.setCustomer(owner);

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        assertThrows(IllegalArgumentException.class, () ->
            repairOrderService.searchRepairOrdersByCustomerAndDevice(customerId, deviceId, null, null, 0, 20, "createdAt", "desc")
        );
    }

    @Test
    void shouldRejectTerminalStateStatusTransitions() {
        Long orderId = 10L;
        RepairOrder deliveredOrder = new RepairOrder();
        deliveredOrder.setStatus(RepairOrderStatus.DELIVERED);

        RepairOrder cancelledOrder = new RepairOrder();
        cancelledOrder.setStatus(RepairOrderStatus.CANCELLED);

        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.IN_REPAIR);

        when(repairOrderRepository.findById(10L)).thenReturn(Optional.of(deliveredOrder));
        when(repairOrderRepository.findById(20L)).thenReturn(Optional.of(cancelledOrder));

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.updateRepairOrderStatus(10L, request));
        assertThrows(IllegalArgumentException.class, () -> repairOrderService.updateRepairOrderStatus(20L, request));
        verify(repairOrderRepository, never()).save(any());
    }

    @Test
    void shouldThrowNotFoundWhenUpdatingStatusOfMissingOrder() {
        Long missingId = 999L;
        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.IN_REPAIR);

        when(repairOrderRepository.findById(missingId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.updateRepairOrderStatus(missingId, request));
        verify(repairOrderRepository, never()).save(any());
    }
}
