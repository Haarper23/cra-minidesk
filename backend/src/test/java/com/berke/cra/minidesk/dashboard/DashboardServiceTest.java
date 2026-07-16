package com.berke.cra.minidesk.dashboard;

import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.dashboard.dto.DashboardResponse;
import com.berke.cra.minidesk.dashboard.dto.RepairStatusCountResponse;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DashboardServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private RepairOrderRepository repairOrderRepository;

    private Clock fixedClock;
    private DashboardService dashboardService;

    private static final Instant FIXED_INSTANT = Instant.parse("2026-07-17T10:30:00Z");

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        fixedClock = Clock.fixed(FIXED_INSTANT, ZoneOffset.UTC);
        dashboardService = new DashboardService(
            customerRepository,
            deviceRepository,
            repairOrderRepository,
            fixedClock
        );
    }

    private void setUpDefaultMocks() {
        when(customerRepository.count()).thenReturn(5L);
        when(deviceRepository.count()).thenReturn(10L);
        when(repairOrderRepository.count()).thenReturn(15L);
        when(repairOrderRepository.countByStatusNotIn(any())).thenReturn(8L);
        when(repairOrderRepository.countByStatus(any(RepairOrderStatus.class))).thenReturn(0L);
        when(repairOrderRepository.countByPriorityAndStatusNotIn(any(), any())).thenReturn(1L);
        when(repairOrderRepository.countByCompletedAtGreaterThanEqualAndCompletedAtLessThan(any(), any())).thenReturn(2L);
        when(repairOrderRepository.countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(any(), any())).thenReturn(3L);
    }

    @Test
    void shouldReturnTotalCustomerCount() {
        setUpDefaultMocks();
        when(customerRepository.count()).thenReturn(123L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(123L, result.totalCustomers());
    }

    @Test
    void shouldReturnTotalDeviceCount() {
        setUpDefaultMocks();
        when(deviceRepository.count()).thenReturn(456L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(456L, result.totalDevices());
    }

    @Test
    void shouldReturnTotalRepairOrderCount() {
        setUpDefaultMocks();
        when(repairOrderRepository.count()).thenReturn(789L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(789L, result.totalRepairOrders());
    }

    @Test
    void shouldCalculateActiveRepairOrdersByExcludingDeliveredAndCancelled() {
        setUpDefaultMocks();
        List<RepairOrderStatus> inactive = List.of(RepairOrderStatus.DELIVERED, RepairOrderStatus.CANCELLED);
        when(repairOrderRepository.countByStatusNotIn(inactive)).thenReturn(14L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(14L, result.activeRepairOrders());
    }

    @Test
    void shouldReturnWaitingForCustomerApprovalCount() {
        setUpDefaultMocks();
        when(repairOrderRepository.countByStatus(RepairOrderStatus.WAITING_FOR_CUSTOMER_APPROVAL)).thenReturn(7L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(7L, result.waitingForCustomerApproval());
    }

    @Test
    void shouldReturnWaitingForPartCount() {
        setUpDefaultMocks();
        when(repairOrderRepository.countByStatus(RepairOrderStatus.WAITING_FOR_PART)).thenReturn(11L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(11L, result.waitingForPart());
    }

    @Test
    void shouldReturnReadyForDeliveryCount() {
        setUpDefaultMocks();
        when(repairOrderRepository.countByStatus(RepairOrderStatus.READY_FOR_DELIVERY)).thenReturn(9L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(9L, result.readyForDelivery());
    }

    @Test
    void shouldReturnActiveUrgentRepairOrderCount() {
        setUpDefaultMocks();
        List<RepairOrderStatus> inactive = List.of(RepairOrderStatus.DELIVERED, RepairOrderStatus.CANCELLED);
        when(repairOrderRepository.countByPriorityAndStatusNotIn(RepairPriority.URGENT, inactive)).thenReturn(3L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(3L, result.urgentRepairOrders());
    }

    @Test
    void shouldCalculateCompletedTodayUsingExactUtcBoundaries() {
        setUpDefaultMocks();
        Instant start = Instant.parse("2026-07-17T00:00:00Z");
        Instant end = Instant.parse("2026-07-18T00:00:00Z");
        when(repairOrderRepository.countByCompletedAtGreaterThanEqualAndCompletedAtLessThan(start, end)).thenReturn(4L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(4L, result.completedToday());
    }

    @Test
    void shouldCalculateDeliveredTodayUsingExactUtcBoundaries() {
        setUpDefaultMocks();
        Instant start = Instant.parse("2026-07-17T00:00:00Z");
        Instant end = Instant.parse("2026-07-18T00:00:00Z");
        when(repairOrderRepository.countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(start, end)).thenReturn(6L);

        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(6L, result.deliveredToday());
    }

    @Test
    void shouldIncludeEveryRepairOrderStatusEnumValue() {
        setUpDefaultMocks();
        DashboardResponse result = dashboardService.getDashboardStatistics();

        List<RepairOrderStatus> mappedStatuses = result.repairOrdersByStatus().stream()
            .map(RepairStatusCountResponse::status)
            .toList();

        assertEquals(RepairOrderStatus.values().length, mappedStatuses.size());
        for (RepairOrderStatus status : RepairOrderStatus.values()) {
            assertTrue(mappedStatuses.contains(status), "Missing status: " + status);
        }
    }

    @Test
    void shouldIncludeStatusesWhoseCountIsZero() {
        setUpDefaultMocks();
        DashboardResponse result = dashboardService.getDashboardStatistics();

        for (RepairStatusCountResponse statusCount : result.repairOrdersByStatus()) {
            assertEquals(0L, statusCount.count());
        }
    }

    @Test
    void shouldPreserveRepairOrderStatusDeclarationOrder() {
        setUpDefaultMocks();
        DashboardResponse result = dashboardService.getDashboardStatistics();

        RepairOrderStatus[] expected = RepairOrderStatus.values();
        List<RepairStatusCountResponse> actual = result.repairOrdersByStatus();

        for (int i = 0; i < expected.length; i++) {
            assertEquals(expected[i], actual.get(i).status());
        }
    }

    @Test
    void shouldReturnGeneratedAtFromTheInjectedFixedClock() {
        setUpDefaultMocks();
        DashboardResponse result = dashboardService.getDashboardStatistics();

        assertEquals(FIXED_INSTANT, result.generatedAt());
    }

    @Test
    void shouldVerifyRepositoryCallsReceiveExactUtcInterval() {
        setUpDefaultMocks();
        Instant start = Instant.parse("2026-07-17T00:00:00Z");
        Instant end = Instant.parse("2026-07-18T00:00:00Z");

        dashboardService.getDashboardStatistics();

        verify(repairOrderRepository).countByCompletedAtGreaterThanEqualAndCompletedAtLessThan(start, end);
        verify(repairOrderRepository).countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(start, end);
    }

    @Test
    void shouldVerifyExcludedStatusesPassedToActiveCountQueriesAreDeliveredAndCancelled() {
        setUpDefaultMocks();
        List<RepairOrderStatus> expectedExcluded = List.of(RepairOrderStatus.DELIVERED, RepairOrderStatus.CANCELLED);

        dashboardService.getDashboardStatistics();

        verify(repairOrderRepository).countByStatusNotIn(expectedExcluded);
        verify(repairOrderRepository).countByPriorityAndStatusNotIn(RepairPriority.URGENT, expectedExcluded);
    }

    @Test
    void shouldVerifyNoEntityCollectionLoadingRepositoryMethodsAreUsed() {
        setUpDefaultMocks();

        dashboardService.getDashboardStatistics();

        verify(repairOrderRepository, never()).findAll();
        verify(repairOrderRepository, never()).findAllByOrderByCreatedAtDesc();
        verify(repairOrderRepository, never()).findByDeviceIdOrderByCreatedAtDesc(any());
        verify(repairOrderRepository, never()).findByStatusOrderByCreatedAtDesc(any());
        verify(customerRepository, never()).findAll();
        verify(deviceRepository, never()).findAll();
    }
}
