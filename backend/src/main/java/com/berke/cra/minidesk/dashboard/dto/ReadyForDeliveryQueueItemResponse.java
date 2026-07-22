package com.berke.cra.minidesk.dashboard.dto;

import java.time.Instant;

public record ReadyForDeliveryQueueItemResponse(
    Long id,
    String orderNumber,
    String customerName,
    String deviceLabel,
    Instant readySince,
    long waitingDays
) {
}
