package com.berke.cra.minidesk.dashboard;

import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.dashboard.dto.DashboardResponse;
import com.berke.cra.minidesk.dashboard.dto.DashboardSummaryResponse;
import com.berke.cra.minidesk.dashboard.dto.DashboardTotalsResponse;
import com.berke.cra.minidesk.dashboard.dto.PriorityQueueItemResponse;
import com.berke.cra.minidesk.dashboard.dto.ReadyForDeliveryQueueItemResponse;
import com.berke.cra.minidesk.dashboard.dto.RecentActivityResponse;
import com.berke.cra.minidesk.dashboard.dto.RecentRepairOrderResponse;
import com.berke.cra.minidesk.dashboard.dto.RepairStatusCountResponse;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.repairorder.RepairOrder;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;
import com.berke.cra.minidesk.repairorder.timeline.RepairOrderTimelineEvent;
import com.berke.cra.minidesk.repairorder.timeline.RepairOrderTimelineRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final DeviceRepository deviceRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final RepairOrderTimelineRepository repairOrderTimelineRepository;
    private final Clock clock;

    public DashboardService(CustomerRepository customerRepository,
                            DeviceRepository deviceRepository,
                            RepairOrderRepository repairOrderRepository,
                            RepairOrderTimelineRepository repairOrderTimelineRepository,
                            Clock clock) {
        this.customerRepository = customerRepository;
        this.deviceRepository = deviceRepository;
        this.repairOrderRepository = repairOrderRepository;
        this.repairOrderTimelineRepository = repairOrderTimelineRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        LocalDate today = LocalDate.now(clock.withZone(ZoneOffset.UTC));
        Instant startOfDay = today.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfNextDay = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<RepairOrderStatus> inactiveStatuses = List.of(RepairOrderStatus.DELIVERED, RepairOrderStatus.CANCELLED);

        // 1. Totals
        long customersCount = Math.max(0L, customerRepository.count());
        long devicesCount = Math.max(0L, deviceRepository.count());
        long totalOrders = Math.max(0L, repairOrderRepository.count());
        long activeOrders = Math.max(0L, repairOrderRepository.countByStatusNotIn(inactiveStatuses));
        long readyForDeliveryCount = Math.max(0L, repairOrderRepository.countByStatus(RepairOrderStatus.READY_FOR_DELIVERY));
        long openedTodayCount = Math.max(0L, repairOrderRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfDay, startOfNextDay));

        // Authoritative source for deliveredToday: real status transitions to DELIVERED recorded in timeline
        long deliveredTodayCount = Math.max(0L, repairOrderTimelineRepository.countDeliveredEventsBetween(startOfDay, startOfNextDay));

        DashboardTotalsResponse totals = new DashboardTotalsResponse(
            customersCount,
            devicesCount,
            totalOrders,
            activeOrders,
            readyForDeliveryCount,
            openedTodayCount,
            deliveredTodayCount
        );

        // 2. Status Distribution (all 10 statuses present)
        Map<RepairOrderStatus, Long> statusCountsMap = new EnumMap<>(RepairOrderStatus.class);
        List<Object[]> grouped = repairOrderRepository.countGroupedByStatus();
        if (grouped != null) {
            for (Object[] row : grouped) {
                if (row.length >= 2 && row[0] instanceof RepairOrderStatus st && row[1] instanceof Long cnt) {
                    statusCountsMap.put(st, cnt);
                }
            }
        }

        List<RepairStatusCountResponse> statusDistribution = Arrays.stream(RepairOrderStatus.values())
            .map(status -> new RepairStatusCountResponse(
                status,
                Math.max(0L, statusCountsMap.getOrDefault(status, 0L))
            ))
            .toList();

        // 3. Recent Repair Orders (max 10, createdAt DESC, id DESC)
        List<RepairOrder> recentOrdersList = repairOrderRepository.findRecentRepairOrders(PageRequest.of(0, 10));
        List<RecentRepairOrderResponse> recentRepairOrders = recentOrdersList.stream()
            .map(ro -> new RecentRepairOrderResponse(
                ro.getId(),
                ro.getOrderNumber(),
                ro.getDevice().getCustomer().getId(),
                ro.getDevice().getCustomer().getFullName(),
                ro.getDevice().getId(),
                ro.getDevice().getBrand() + " " + ro.getDevice().getModel(),
                ro.getStatus(),
                ro.getPriority(),
                ro.getCreatedAt(),
                ro.getUpdatedAt()
            ))
            .toList();

        // 4. Priority Queue (URGENT then HIGH, active only, oldest first, max 10)
        List<RepairOrder> priorityOrdersList = repairOrderRepository.findPriorityQueue(
            inactiveStatuses,
            List.of(RepairPriority.URGENT, RepairPriority.HIGH),
            PageRequest.of(0, 10)
        );
        List<PriorityQueueItemResponse> priorityQueue = priorityOrdersList.stream()
            .map(ro -> {
                LocalDate createdDate = ro.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
                long age = Math.max(0L, ChronoUnit.DAYS.between(createdDate, today));
                return new PriorityQueueItemResponse(
                    ro.getId(),
                    ro.getOrderNumber(),
                    ro.getDevice().getCustomer().getFullName(),
                    ro.getDevice().getBrand() + " " + ro.getDevice().getModel(),
                    ro.getStatus(),
                    ro.getPriority(),
                    ro.getCreatedAt(),
                    age
                );
            })
            .toList();

        // 5. Ready For Delivery Queue (READY_FOR_DELIVERY status only, longest waiting first, max 10)
        List<RepairOrder> readyOrdersList = repairOrderRepository.findReadyForDeliveryQueue(
            RepairOrderStatus.READY_FOR_DELIVERY,
            PageRequest.of(0, 10)
        );

        Map<Long, Instant> readySinceMap = new java.util.HashMap<>();
        List<Object[]> readyTimestamps = repairOrderTimelineRepository.findReadyForDeliveryTimestamps();
        if (readyTimestamps != null) {
            for (Object[] row : readyTimestamps) {
                if (row.length >= 2 && row[0] instanceof Long roId && row[1] instanceof Instant ts) {
                    readySinceMap.putIfAbsent(roId, ts);
                }
            }
        }

        List<ReadyForDeliveryQueueItemResponse> readyForDeliveryQueue = readyOrdersList.stream()
            .map(ro -> {
                Instant readySince = readySinceMap.getOrDefault(
                    ro.getId(),
                    ro.getUpdatedAt() != null ? ro.getUpdatedAt() : ro.getCreatedAt()
                );
                LocalDate readyDate = readySince.atZone(ZoneOffset.UTC).toLocalDate();
                long waiting = Math.max(0L, ChronoUnit.DAYS.between(readyDate, today));
                return new ReadyForDeliveryQueueItemResponse(
                    ro.getId(),
                    ro.getOrderNumber(),
                    ro.getDevice().getCustomer().getFullName(),
                    ro.getDevice().getBrand() + " " + ro.getDevice().getModel(),
                    readySince,
                    waiting
                );
            })
            .toList();

        // 6. Recent Activity (max 10 timeline events, createdAt DESC)
        List<RepairOrderTimelineEvent> eventsList = repairOrderTimelineRepository.findRecentActivity(PageRequest.of(0, 10));
        List<RecentActivityResponse> recentActivity = eventsList.stream()
            .map(ev -> new RecentActivityResponse(
                ev.getId(),
                ev.getRepairOrder().getId(),
                ev.getRepairOrder().getOrderNumber(),
                ev.getEventType().name(),
                ev.getDescription(),
                ev.getCreatedAt()
            ))
            .toList();

        Instant generatedAt = Instant.now(clock);

        return new DashboardSummaryResponse(
            generatedAt,
            totals,
            statusDistribution,
            recentRepairOrders,
            priorityQueue,
            readyForDeliveryQueue,
            recentActivity
        );
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStatistics() {
        DashboardSummaryResponse summary = getDashboardSummary();
        long waitingForApproval = repairOrderRepository.countByStatus(RepairOrderStatus.WAITING_FOR_CUSTOMER_APPROVAL);
        long waitingForPart = repairOrderRepository.countByStatus(RepairOrderStatus.WAITING_FOR_PART);
        long urgentOrders = repairOrderRepository.countByPriorityAndStatusNotIn(
            RepairPriority.URGENT,
            List.of(RepairOrderStatus.DELIVERED, RepairOrderStatus.CANCELLED)
        );

        return new DashboardResponse(
            summary.totals().customers(),
            summary.totals().devices(),
            summary.totals().repairOrders(),
            summary.totals().activeRepairOrders(),
            waitingForApproval,
            waitingForPart,
            summary.totals().readyForDelivery(),
            urgentOrders,
            summary.totals().openedToday(),
            summary.totals().deliveredToday(),
            summary.statusDistribution(),
            summary.generatedAt()
        );
    }
}
