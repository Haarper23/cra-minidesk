package com.berke.cra.minidesk.dashboard.dto;

import java.time.Instant;

public record RecentActivityResponse(
    Long id,
    Long repairOrderId,
    String orderNumber,
    String eventType,
    String description,
    Instant createdAt
) {
}
