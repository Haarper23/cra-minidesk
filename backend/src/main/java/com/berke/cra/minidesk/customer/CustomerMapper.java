package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.customer.dto.UpdateCustomerRequest;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toEntity(CreateCustomerRequest request) {
        if (request == null) {
            return null;
        }
        return new Customer(
            request.fullName(),
            request.email(),
            request.phoneNumber(),
            request.notes()
        );
    }

    public CustomerResponse toResponse(Customer customer) {
        if (customer == null) {
            return null;
        }
        return new CustomerResponse(
            customer.getId(),
            customer.getFullName(),
            customer.getEmail(),
            customer.getPhoneNumber(),
            customer.getNotes(),
            customer.getCreatedAt(),
            customer.getUpdatedAt()
        );
    }

    public void updateEntity(Customer customer, UpdateCustomerRequest request) {
        if (customer == null || request == null) {
            return;
        }
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setNotes(request.notes());
    }
}
