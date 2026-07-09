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
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
            .map(customerMapper::toResponse)
            .toList();
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
