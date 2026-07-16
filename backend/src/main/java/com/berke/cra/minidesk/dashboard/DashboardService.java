package com.berke.cra.minidesk.dashboard;

import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.dashboard.dto.DashboardResponse;
import com.berke.cra.minidesk.dashboard.dto.RepairStatusCountResponse;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final DeviceRepository deviceRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final Clock clock;

    public DashboardService(CustomerRepository customerRepository,
                            DeviceRepository deviceRepository,
                            RepairOrderRepository repairOrderRepository,
                            Clock clock) {
        this.customerRepository = customerRepository;
        this.deviceRepository = deviceRepository;
        this.repairOrderRepository = repairOrderRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStatistics() {
        LocalDate today = LocalDate.now(clock.withZone(ZoneOffset.UTC));
        Instant startOfDay = today.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfNextDay = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<RepairOrderStatus> inactiveStatuses = List.of(RepairOrderStatus.DELIVERED, RepairOrderStatus.CANCELLED);

        long totalCustomers = Math.max(0L, customerRepository.count());
        long totalDevices = Math.max(0L, deviceRepository.count());
        long totalRepairOrders = Math.max(0L, repairOrderRepository.count());
        long activeRepairOrders = Math.max(0L, repairOrderRepository.countByStatusNotIn(inactiveStatuses));
        long waitingForCustomerApproval = Math.max(0L, repairOrderRepository.countByStatus(RepairOrderStatus.WAITING_FOR_CUSTOMER_APPROVAL));
        long waitingForPart = Math.max(0L, repairOrderRepository.countByStatus(RepairOrderStatus.WAITING_FOR_PART));
        long readyForDelivery = Math.max(0L, repairOrderRepository.countByStatus(RepairOrderStatus.READY_FOR_DELIVERY));
        long urgentRepairOrders = Math.max(0L, repairOrderRepository.countByPriorityAndStatusNotIn(RepairPriority.URGENT, inactiveStatuses));
        long completedToday = Math.max(0L, repairOrderRepository.countByCompletedAtGreaterThanEqualAndCompletedAtLessThan(startOfDay, startOfNextDay));
        long deliveredToday = Math.max(0L, repairOrderRepository.countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(startOfDay, startOfNextDay));

        List<RepairStatusCountResponse> repairOrdersByStatus = Arrays.stream(RepairOrderStatus.values())
            .map(status -> new RepairStatusCountResponse(
                status,
                Math.max(0L, repairOrderRepository.countByStatus(status))
            ))
            .toList();

        Instant generatedAt = Instant.now(clock);

        return new DashboardResponse(
            totalCustomers,
            totalDevices,
            totalRepairOrders,
            activeRepairOrders,
            waitingForCustomerApproval,
            waitingForPart,
            readyForDelivery,
            urgentRepairOrders,
            completedToday,
            deliveredToday,
            repairOrdersByStatus,
            generatedAt
        );
    }
}
