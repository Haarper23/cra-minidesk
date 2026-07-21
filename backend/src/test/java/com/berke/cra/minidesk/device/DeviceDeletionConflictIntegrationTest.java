package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.repairorder.RepairOrder;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairPriority;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.testsupport.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class DeviceDeletionConflictIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private RepairOrderRepository repairOrderRepository;

    @Test
    void shouldReturn409ConflictAndPreserveDataWhenDeletingDeviceWithRepairOrders() throws Exception {
        Customer customer = customerRepository.save(new Customer("Device Owner", "device.owner@example.com", "05551112233", "Notes"));
        Device device = deviceRepository.save(new Device(customer, "HP", "Pavilion", "SN-DEV-409", DeviceType.LAPTOP, "Blue", "Mouse", "Notes"));

        RepairOrder repairOrder = new RepairOrder(
                "RO-DEV-409",
                device,
                "Screen flickering",
                "Faulty cable",
                "Replaced cable",
                RepairOrderStatus.RECEIVED,
                RepairPriority.NORMAL,
                new BigDecimal("150.00"),
                null,
                Instant.now()
        );
        RepairOrder savedOrder = repairOrderRepository.save(repairOrder);

        mockMvc.perform(delete("/api/devices/{id}", device.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Device cannot be deleted because related repair orders exist")))
                .andExpect(jsonPath("$.errors", nullValue()));

        assertTrue(deviceRepository.existsById(device.getId()), "Device must remain intact after 409 Conflict");
        assertTrue(repairOrderRepository.existsById(savedOrder.getId()), "Repair order must remain intact after 409 Conflict");
    }

    @Test
    void shouldReturn404WhenDeletingNonExistentDevice() throws Exception {
        mockMvc.perform(delete("/api/devices/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void shouldDeleteUnreferencedDeviceSuccessfully() throws Exception {
        Customer customer = customerRepository.save(new Customer("Clean Owner", "clean.owner@example.com", "05559998877", "Notes"));
        Device device = deviceRepository.save(new Device(customer, "Lenovo", "ThinkPad", "SN-CLEAN-204", DeviceType.LAPTOP, "Black", null, null));

        mockMvc.perform(delete("/api/devices/{id}", device.getId()))
                .andExpect(status().isNoContent());

        assertFalse(deviceRepository.existsById(device.getId()), "Device should be deleted");
    }
}

