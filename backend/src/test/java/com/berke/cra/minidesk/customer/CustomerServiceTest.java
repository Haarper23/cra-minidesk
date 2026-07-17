package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.customer.dto.UpdateCustomerRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldCreateCustomer() {
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "john@example.com", "123456", "Some notes");
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Some notes");
        CustomerResponse response = new CustomerResponse(1L, "John Doe", "john@example.com", "123456", "Some notes", Instant.now(), Instant.now());

        when(customerRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
        when(customerMapper.toEntity(request)).thenReturn(customer);
        when(customerRepository.save(customer)).thenReturn(customer);
        when(customerMapper.toResponse(customer)).thenReturn(response);

        CustomerResponse result = customerService.createCustomer(request);

        assertNotNull(result);
        assertEquals("John Doe", result.fullName());
        assertEquals("john@example.com", result.email());
        verify(customerRepository, times(1)).save(customer);
    }

    @Test
    void shouldRejectDuplicateEmail() {
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "john@example.com", "123456", "Some notes");

        when(customerRepository.existsByEmailIgnoreCase(request.email())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> customerService.createCustomer(request));
        verify(customerRepository, never()).save(any());
    }

    @Test
    void shouldReturnCustomerById() {
        Long customerId = 1L;
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Some notes");
        CustomerResponse response = new CustomerResponse(customerId, "John Doe", "john@example.com", "123456", "Some notes", Instant.now(), Instant.now());

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(customerMapper.toResponse(customer)).thenReturn(response);

        CustomerResponse result = customerService.getCustomerById(customerId);

        assertNotNull(result);
        assertEquals(customerId, result.id());
        assertEquals("John Doe", result.fullName());
    }

    @Test
    void shouldThrowNotFoundForMissingCustomer() {
        Long customerId = 999L;
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerById(customerId));
    }

    @Test
    void shouldUpdateCustomer() {
        Long customerId = 1L;
        UpdateCustomerRequest request = new UpdateCustomerRequest("Jane Doe", "jane@example.com", "654321", "Updated notes");
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Some notes");
        customer.setId(customerId);

        CustomerResponse response = new CustomerResponse(customerId, "Jane Doe", "jane@example.com", "654321", "Updated notes", Instant.now(), Instant.now());

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(customerRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.empty());
        when(customerRepository.save(customer)).thenReturn(customer);
        when(customerMapper.toResponse(customer)).thenReturn(response);

        CustomerResponse result = customerService.updateCustomer(customerId, request);

        assertNotNull(result);
        assertEquals("Jane Doe", result.fullName());
        assertEquals("jane@example.com", result.email());
        verify(customerMapper, times(1)).updateEntity(customer, request);
    }

    @Test
    void shouldDeleteCustomer() {
        Long customerId = 1L;
        when(customerRepository.existsById(customerId)).thenReturn(true);

        assertDoesNotThrow(() -> customerService.deleteCustomer(customerId));
        verify(customerRepository, times(1)).deleteById(customerId);
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldSearchCustomersAndReturnPageResponse() {
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Some notes");
        CustomerResponse response = new CustomerResponse(1L, "John Doe", "john@example.com", "123456", "Some notes", Instant.now(), Instant.now());
        org.springframework.data.domain.Page<Customer> page = new org.springframework.data.domain.PageImpl<>(
            List.of(customer),
            org.springframework.data.domain.PageRequest.of(0, 20),
            1
        );

        when(customerRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);
        when(customerMapper.toResponse(customer)).thenReturn(response);

        com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse> results = customerService.searchCustomers(
            "John", 0, 20, "fullName", "asc"
        );

        assertNotNull(results);
        assertEquals(1, results.content().size());
        assertEquals("John Doe", results.content().get(0).fullName());
        assertEquals(0, results.page());
        assertEquals(20, results.size());
        assertEquals(1L, results.totalElements());
    }

    @Test
    void shouldRejectSearchWithInvalidSortField() {
        assertThrows(IllegalArgumentException.class, () ->
            customerService.searchCustomers(null, 0, 20, "invalidField", "asc")
        );
    }

    @Test
    void shouldRejectSearchWithInvalidSortDirection() {
        assertThrows(IllegalArgumentException.class, () ->
            customerService.searchCustomers(null, 0, 20, "fullName", "invalidDir")
        );
    }

    @Test
    void shouldRejectSearchWithNegativePage() {
        assertThrows(IllegalArgumentException.class, () ->
            customerService.searchCustomers(null, -1, 20, "fullName", "asc")
        );
    }

    @Test
    void shouldRejectSearchWithZeroSize() {
        assertThrows(IllegalArgumentException.class, () ->
            customerService.searchCustomers(null, 0, 0, "fullName", "asc")
        );
    }

    @Test
    void shouldRejectSearchWithLargeSize() {
        assertThrows(IllegalArgumentException.class, () ->
            customerService.searchCustomers(null, 0, 101, "fullName", "asc")
        );
    }
}
