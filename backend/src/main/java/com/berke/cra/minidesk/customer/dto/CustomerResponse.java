package com.berke.cra.minidesk.customer.dto;

import java.time.Instant;

public record CustomerResponse(
    Long id,
    String fullName,
    String email,
    String phoneNumber,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {
}
