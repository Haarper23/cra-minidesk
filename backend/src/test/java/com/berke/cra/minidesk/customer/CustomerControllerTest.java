package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.common.error.ResourceConflictException;
import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.customer.dto.UpdateCustomerRequest;
import com.berke.cra.minidesk.testsupport.PostgresIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class CustomerControllerTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    @Test
    void shouldCreateCustomer() throws Exception {
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "john@example.com", "123456", "Some notes");
        CustomerResponse response = new CustomerResponse(1L, "John Doe", "john@example.com", "123456", "Some notes", Instant.now(), Instant.now());

        when(customerService.createCustomer(any(CreateCustomerRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Customer created successfully")))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.fullName", is("John Doe")))
                .andExpect(jsonPath("$.data.email", is("john@example.com")));
    }

    @Test
    void shouldRejectInvalidEmail() throws Exception {
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "invalid-email", "123456", "Some notes");

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.email", is("Invalid email format")));

        verify(customerService, never()).createCustomer(any());
    }

    @Test
    void shouldGetAllCustomers() throws Exception {
        CustomerResponse response = new CustomerResponse(1L, "John Doe", "john@example.com", "123456", "Some notes", Instant.now(), Instant.now());
        com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse> pageResponse = new com.berke.cra.minidesk.common.pagination.PageResponse<>(
            List.of(response), 0, 20, 1L, 1, true, true, false, false
        );
        when(customerService.searchCustomers(null, 0, 20, "createdAt", "desc")).thenReturn(pageResponse);

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].fullName", is("John Doe")));
    }

    @Test
    void shouldGetCustomerById() throws Exception {
        Long customerId = 1L;
        CustomerResponse response = new CustomerResponse(customerId, "John Doe", "john@example.com", "123456", "Some notes", Instant.now(), Instant.now());
        when(customerService.getCustomerById(customerId)).thenReturn(response);

        mockMvc.perform(get("/api/customers/{id}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.fullName", is("John Doe")));
    }

    @Test
    void shouldReturn404ForMissingCustomer() throws Exception {
        Long customerId = 999L;
        when(customerService.getCustomerById(customerId)).thenThrow(new ResourceNotFoundException("Customer with ID 999 not found"));

        mockMvc.perform(get("/api/customers/{id}", customerId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Customer with ID 999 not found")));
    }

    @Test
    void shouldUpdateCustomer() throws Exception {
        Long customerId = 1L;
        UpdateCustomerRequest request = new UpdateCustomerRequest("Jane Doe", "jane@example.com", "654321", "Updated notes");
        CustomerResponse response = new CustomerResponse(customerId, "Jane Doe", "jane@example.com", "654321", "Updated notes", Instant.now(), Instant.now());

        when(customerService.updateCustomer(eq(customerId), any(UpdateCustomerRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/customers/{id}", customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.fullName", is("Jane Doe")))
                .andExpect(jsonPath("$.data.email", is("jane@example.com")));
    }

    @Test
    void shouldDeleteCustomer() throws Exception {
        Long customerId = 1L;
        doNothing().when(customerService).deleteCustomer(customerId);

        mockMvc.perform(delete("/api/customers/{id}", customerId))
                .andExpect(status().isNoContent());

        verify(customerService, times(1)).deleteCustomer(customerId);
    }

    @Test
    void shouldReturn409ForDeleteConflictWhenRelatedDataExists() throws Exception {
        Long customerId = 1L;
        doThrow(new ResourceConflictException("Customer cannot be deleted because related devices or repair orders exist"))
                .when(customerService).deleteCustomer(customerId);

        mockMvc.perform(delete("/api/customers/{id}", customerId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Customer cannot be deleted because related devices or repair orders exist")))
                .andExpect(jsonPath("$.errors", nullValue()));
    }

    @Test
    void shouldReturn400ForInvalidSorting() throws Exception {
        when(customerService.searchCustomers(any(), anyInt(), anyInt(), eq("invalidField"), any()))
                .thenThrow(new IllegalArgumentException("Sorting by field 'invalidField' is not supported"));

        mockMvc.perform(get("/api/customers").param("sortBy", "invalidField"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Sorting by field 'invalidField' is not supported")));
    }

    @Test
    void shouldReturn400ForInvalidDirection() throws Exception {
        when(customerService.searchCustomers(any(), anyInt(), anyInt(), any(), eq("invalidDir")))
                .thenThrow(new IllegalArgumentException("Sort direction 'invalidDir' is not supported"));

        mockMvc.perform(get("/api/customers").param("sortDirection", "invalidDir"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Sort direction 'invalidDir' is not supported")));
    }

    @Test
    void shouldReturn400ForNegativePage() throws Exception {
        when(customerService.searchCustomers(any(), eq(-1), anyInt(), any(), any()))
                .thenThrow(new IllegalArgumentException("Page index must not be negative"));

        mockMvc.perform(get("/api/customers").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Page index must not be negative")));
    }

    @Test
    void shouldReturn400ForZeroSize() throws Exception {
        when(customerService.searchCustomers(any(), anyInt(), eq(0), any(), any()))
                .thenThrow(new IllegalArgumentException("Page size must not be less than 1"));

        mockMvc.perform(get("/api/customers").param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Page size must not be less than 1")));
    }

    @Test
    void shouldReturn400ForLargeSize() throws Exception {
        when(customerService.searchCustomers(any(), anyInt(), eq(101), any(), any()))
                .thenThrow(new IllegalArgumentException("Page size must not be greater than 100"));

        mockMvc.perform(get("/api/customers").param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Page size must not be greater than 100")));
    }

    @Test
    void shouldAcceptSearchQueryParamsAndReturnPageResponse() throws Exception {
        CustomerResponse response = new CustomerResponse(1L, "Jane Smith", "jane.smith@example.com", "123456", "Some notes", Instant.now(), Instant.now());
        com.berke.cra.minidesk.common.pagination.PageResponse<CustomerResponse> pageResponse = new com.berke.cra.minidesk.common.pagination.PageResponse<>(
            List.of(response), 0, 5, 1L, 1, true, true, false, false
        );

        when(customerService.searchCustomers("Jane", 0, 5, "fullName", "asc")).thenReturn(pageResponse);

        mockMvc.perform(get("/api/customers")
                .param("query", "Jane")
                .param("page", "0")
                .param("size", "5")
                .param("sortBy", "fullName")
                .param("sortDirection", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].fullName", is("Jane Smith")))
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(5)))
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.totalPages", is(1)))
                .andExpect(jsonPath("$.data.first", is(true)))
                .andExpect(jsonPath("$.data.last", is(true)))
                .andExpect(jsonPath("$.data.hasNext", is(false)))
                .andExpect(jsonPath("$.data.hasPrevious", is(false)));
    }
}
