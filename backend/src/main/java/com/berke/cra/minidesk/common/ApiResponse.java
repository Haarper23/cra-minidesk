package com.berke.cra.minidesk.common;

/**
 * A standard wrapper for API responses.
 *
 * @param success Indicates if the operation was successful
 * @param message Human-readable message detailing the outcome
 * @param data    The payload payload returned by the endpoint (can be null)
 * @param <T>     Type of the data payload
 */
public record ApiResponse<T>(
    boolean success,
    String message,
    T data
) {
}
