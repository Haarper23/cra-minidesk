package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.device.Device;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.device.DeviceType;
import com.berke.cra.minidesk.testsupport.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class CustomerDeletionConflictIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Test
    void shouldReturn409ConflictAndPreserveDataWhenDeletingCustomerWithDevices() throws Exception {
        Customer customer = new Customer("Conflict Customer", "conflict.customer@example.com", "05550001122", "Notes");
        Customer savedCustomer = customerRepository.save(customer);

        Device device = new Device(
                savedCustomer,
                "Dell",
                "OptiPlex 7090",
                "SN-CONFLICT-123",
                DeviceType.DESKTOP,
                "Black",
                "Power cable",
                "Scratch on side"
        );
        Device savedDevice = deviceRepository.save(device);

        mockMvc.perform(delete("/api/customers/{id}", savedCustomer.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Customer cannot be deleted because related devices or repair orders exist")))
                .andExpect(jsonPath("$.errors", nullValue()));

        assertTrue(customerRepository.existsById(savedCustomer.getId()), "Customer must remain intact after 409 Conflict");
        assertTrue(deviceRepository.existsById(savedDevice.getId()), "Device must remain intact after 409 Conflict");
    }
}
