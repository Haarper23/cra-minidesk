package com.berke.cra.minidesk.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCustomerRequest(
    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name cannot exceed 120 characters")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 160, message = "Email cannot exceed 160 characters")
    String email,

    @Size(max = 40, message = "Phone number cannot exceed 40 characters")
    String phoneNumber,

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    String notes
) {
}
