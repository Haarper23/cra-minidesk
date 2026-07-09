package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.customer.dto.UpdateCustomerRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
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

@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerTest {

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
        when(customerService.getAllCustomers()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].fullName", is("John Doe")));
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
}
