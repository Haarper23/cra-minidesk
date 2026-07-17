package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.common.ApiResponse;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.customer.dto.UpdateCustomerRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse customer = customerService.createCustomer(request);
        ApiResponse<CustomerResponse> response = new ApiResponse<>(
            true,
            "Customer created successfully",
            customer
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse>>> getAllCustomers(
            @org.springframework.web.bind.annotation.RequestParam(value = "query", required = false) String query,
            @org.springframework.web.bind.annotation.RequestParam(value = "page", defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(value = "size", defaultValue = "20") int size,
            @org.springframework.web.bind.annotation.RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @org.springframework.web.bind.annotation.RequestParam(value = "sortDirection", defaultValue = "desc") String sortDirection) {

        com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse> pageResponse = customerService.searchCustomers(
            query, page, size, sortBy, sortDirection
        );
        ApiResponse<com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse>> response = new ApiResponse<>(
            true,
            "Customers retrieved successfully",
            pageResponse
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        ApiResponse<CustomerResponse> response = new ApiResponse<>(
            true,
            "Customer retrieved successfully",
            customer
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
        @PathVariable Long id,
        @Valid @RequestBody UpdateCustomerRequest request
    ) {
        CustomerResponse customer = customerService.updateCustomer(id, request);
        ApiResponse<CustomerResponse> response = new ApiResponse<>(
            true,
            "Customer updated successfully",
            customer
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
