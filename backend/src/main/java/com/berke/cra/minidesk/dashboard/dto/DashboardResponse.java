package com.berke.cra.minidesk.dashboard.dto;

import java.time.Instant;
import java.util.List;

public record DashboardResponse(
    long totalCustomers,
    long totalDevices,
    long totalRepairOrders,
    long activeRepairOrders,
    long waitingForCustomerApproval,
    long waitingForPart,
    long readyForDelivery,
    long urgentRepairOrders,
    long completedToday,
    long deliveredToday,
    List<RepairStatusCountResponse> repairOrdersByStatus,
    Instant generatedAt
) {
}
