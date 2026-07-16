package com.berke.cra.minidesk.repairorder.timeline;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.repairorder.RepairOrder;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.timeline.dto.RepairOrderTimelineResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RepairOrderTimelineServiceTest {

    @Mock
    private RepairOrderTimelineRepository repairOrderTimelineRepository;

    @Mock
    private RepairOrderRepository repairOrderRepository;

    @Mock
    private RepairOrderTimelineMapper repairOrderTimelineMapper;

    @InjectMocks
    private RepairOrderTimelineService repairOrderTimelineService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldRecordRepairOrderCreatedEvent() {
        RepairOrder repairOrder = new RepairOrder();
        repairOrder.setStatus(RepairOrderStatus.RECEIVED);

        repairOrderTimelineService.recordRepairOrderCreated(repairOrder);

        ArgumentCaptor<RepairOrderTimelineEvent> captor = ArgumentCaptor.forClass(RepairOrderTimelineEvent.class);
        verify(repairOrderTimelineRepository, times(1)).save(captor.capture());

        RepairOrderTimelineEvent captured = captor.getValue();
        assertEquals(RepairOrderTimelineEventType.REPAIR_ORDER_CREATED, captured.getEventType());
        assertEquals("Repair order created with status RECEIVED", captured.getDescription());
        assertNull(captured.getPreviousStatus());
        assertEquals(RepairOrderStatus.RECEIVED, captured.getNewStatus());
        assertNull(captured.getMetadata());
    }

    @Test
    void shouldRecordStatusChangedEvent() {
        RepairOrder repairOrder = new RepairOrder();
        repairOrder.setStatus(RepairOrderStatus.DIAGNOSING);

        repairOrderTimelineService.recordStatusChanged(repairOrder, RepairOrderStatus.RECEIVED, RepairOrderStatus.DIAGNOSING);

        ArgumentCaptor<RepairOrderTimelineEvent> captor = ArgumentCaptor.forClass(RepairOrderTimelineEvent.class);
        verify(repairOrderTimelineRepository, times(1)).save(captor.capture());

        RepairOrderTimelineEvent captured = captor.getValue();
        assertEquals(RepairOrderTimelineEventType.STATUS_CHANGED, captured.getEventType());
        assertEquals("Repair order status changed from RECEIVED to DIAGNOSING", captured.getDescription());
        assertEquals(RepairOrderStatus.RECEIVED, captured.getPreviousStatus());
        assertEquals(RepairOrderStatus.DIAGNOSING, captured.getNewStatus());
        assertNull(captured.getMetadata());
    }

    @Test
    void shouldRecordDetailsUpdatedEvent() {
        RepairOrder repairOrder = new RepairOrder();
        String metadata = "{\"changedFields\":[\"priority\",\"estimatedCost\"]}";

        repairOrderTimelineService.recordRepairDetailsUpdated(repairOrder, metadata);

        ArgumentCaptor<RepairOrderTimelineEvent> captor = ArgumentCaptor.forClass(RepairOrderTimelineEvent.class);
        verify(repairOrderTimelineRepository, times(1)).save(captor.capture());

        RepairOrderTimelineEvent captured = captor.getValue();
        assertEquals(RepairOrderTimelineEventType.REPAIR_DETAILS_UPDATED, captured.getEventType());
        assertEquals("Repair order details updated", captured.getDescription());
        assertNull(captured.getPreviousStatus());
        assertNull(captured.getNewStatus());
        assertEquals(metadata, captured.getMetadata());
    }

    @Test
    void shouldReturnTimelineInChronologicalDeterministicOrder() {
        Long repairOrderId = 1L;
        RepairOrderTimelineEvent event1 = new RepairOrderTimelineEvent();
        RepairOrderTimelineEvent event2 = new RepairOrderTimelineEvent();

        RepairOrderTimelineResponse response1 = new RepairOrderTimelineResponse(
                10L, repairOrderId, RepairOrderTimelineEventType.REPAIR_ORDER_CREATED, null, RepairOrderStatus.RECEIVED,
                "Repair order created", null, Instant.now()
        );
        RepairOrderTimelineResponse response2 = new RepairOrderTimelineResponse(
                11L, repairOrderId, RepairOrderTimelineEventType.STATUS_CHANGED, RepairOrderStatus.RECEIVED, RepairOrderStatus.DIAGNOSING,
                "Status changed", null, Instant.now()
        );

        when(repairOrderRepository.existsById(repairOrderId)).thenReturn(true);
        when(repairOrderTimelineRepository.findByRepairOrderIdOrderByCreatedAtAscIdAsc(repairOrderId))
                .thenReturn(List.of(event1, event2));
        when(repairOrderTimelineMapper.toResponse(event1)).thenReturn(response1);
        when(repairOrderTimelineMapper.toResponse(event2)).thenReturn(response2);

        List<RepairOrderTimelineResponse> results = repairOrderTimelineService.getTimelineByRepairOrderId(repairOrderId);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(10L, results.get(0).id());
        assertEquals(11L, results.get(1).id());
        verify(repairOrderTimelineRepository, times(1)).findByRepairOrderIdOrderByCreatedAtAscIdAsc(repairOrderId);
    }

    @Test
    void shouldReturnEmptyTimelineForExistingRepairOrderWithNoEvents() {
        Long repairOrderId = 1L;
        when(repairOrderRepository.existsById(repairOrderId)).thenReturn(true);
        when(repairOrderTimelineRepository.findByRepairOrderIdOrderByCreatedAtAscIdAsc(repairOrderId))
                .thenReturn(List.of());

        List<RepairOrderTimelineResponse> results = repairOrderTimelineService.getTimelineByRepairOrderId(repairOrderId);

        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void shouldThrowNotFoundForMissingRepairOrder() {
        Long repairOrderId = 999L;
        when(repairOrderRepository.existsById(repairOrderId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> repairOrderTimelineService.getTimelineByRepairOrderId(repairOrderId));
        verify(repairOrderTimelineRepository, never()).findByRepairOrderIdOrderByCreatedAtAscIdAsc(any());
    }
}
