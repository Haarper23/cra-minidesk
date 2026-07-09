package com.berke.cra.minidesk.common.error;

import java.time.Instant;
import java.util.Map;

/**
 * Standard API error response payload representation.
 */
public record ApiErrorResponse(
    boolean success,
    String message,
    Map<String, String> errors,
    Instant timestamp
) {
    public ApiErrorResponse(String message, Map<String, String> errors) {
        this(false, message, errors, Instant.now());
    }

    public ApiErrorResponse(String message) {
        this(false, message, null, Instant.now());
    }
}
