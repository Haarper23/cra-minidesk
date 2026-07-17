package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.customer.dto.UpdateCustomerRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Customer with email '" + request.email() + "' already exists");
        }
        Customer customer = customerMapper.toEntity(request);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(savedCustomer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + id + " not found"));
        return customerMapper.toResponse(customer);
    }

    @Transactional(readOnly = true)
    public com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse> searchCustomers(
            String query,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        java.util.Set<String> allowedFields = java.util.Set.of("id", "fullName", "email", "createdAt", "updatedAt");
        org.springframework.data.domain.Pageable pageable = com.berke.cra.minidesk.common.pagination.PaginationUtils.createPageable(
            page, size, sortBy, sortDirection, allowedFields
        );

        org.springframework.data.jpa.domain.Specification<Customer> spec = CustomerSpecifications.hasText(query);
        org.springframework.data.domain.Page<Customer> customerPage = customerRepository.findAll(spec, pageable);

        return com.berke.cra.minidesk.common.pagination.PageResponse.fromPage(customerPage, customerMapper::toResponse);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + id + " not found"));

        customerRepository.findByEmailIgnoreCase(request.email())
            .ifPresent(existingCustomer -> {
                if (!existingCustomer.getId().equals(id)) {
                    throw new IllegalArgumentException("Customer with email '" + request.email() + "' already exists");
                }
            });

        customerMapper.updateEntity(customer, request);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(updatedCustomer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer with ID " + id + " not found");
        }
        customerRepository.deleteById(id);
    }
}
