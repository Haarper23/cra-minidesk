package com.berke.cra.minidesk.dashboard.dto;

import java.time.Instant;
import java.util.List;

public record DashboardSummaryResponse(
    Instant generatedAt,
    DashboardTotalsResponse totals,
    List<RepairStatusCountResponse> statusDistribution,
    List<RecentRepairOrderResponse> recentRepairOrders,
    List<PriorityQueueItemResponse> priorityQueue,
    List<ReadyForDeliveryQueueItemResponse> readyForDeliveryQueue,
    List<RecentActivityResponse> recentActivity
) {
}
