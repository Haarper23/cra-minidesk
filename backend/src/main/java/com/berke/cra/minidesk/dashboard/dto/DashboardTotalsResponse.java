package com.berke.cra.minidesk.dashboard.dto;

public record DashboardTotalsResponse(
    long customers,
    long devices,
    long repairOrders,
    long activeRepairOrders,
    long readyForDelivery,
    long openedToday,
    long deliveredToday
) {
}
