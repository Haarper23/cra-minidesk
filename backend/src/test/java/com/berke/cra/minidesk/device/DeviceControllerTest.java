package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
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
class DeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeviceService deviceService;

    @Test
    void shouldCreateDevice() throws Exception {
        Long customerId = 1L;
        CreateDeviceRequest request = new CreateDeviceRequest("Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch");
        DeviceResponse response = new DeviceResponse(10L, customerId, "John Doe", "Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch", Instant.now(), Instant.now());

        when(deviceService.createDevice(eq(customerId), any(CreateDeviceRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/customers/{customerId}/devices", customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Device created successfully")))
                .andExpect(jsonPath("$.data.id", is(10)))
                .andExpect(jsonPath("$.data.brand", is("Apple")))
                .andExpect(jsonPath("$.data.model", is("MacBook Air")));
    }

    @Test
    void shouldRejectInvalidDevice() throws Exception {
        Long customerId = 1L;
        // Brand is blank, which should fail validation
        CreateDeviceRequest request = new CreateDeviceRequest("", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch");

        mockMvc.perform(post("/api/customers/{customerId}/devices", customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.brand", is("Brand is required")));

        verify(deviceService, never()).createDevice(any(), any());
    }

    @Test
    void shouldGetDevicesByCustomerId() throws Exception {
        Long customerId = 1L;
        DeviceResponse response = new DeviceResponse(10L, customerId, "John Doe", "Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch", Instant.now(), Instant.now());
        when(deviceService.getDevicesByCustomerId(customerId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/customers/{customerId}/devices", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].brand", is("Apple")));
    }

    @Test
    void shouldGetDeviceById() throws Exception {
        Long deviceId = 10L;
        DeviceResponse response = new DeviceResponse(deviceId, 1L, "John Doe", "Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch", Instant.now(), Instant.now());
        when(deviceService.getDeviceById(deviceId)).thenReturn(response);

        mockMvc.perform(get("/api/devices/{id}", deviceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(10)))
                .andExpect(jsonPath("$.data.brand", is("Apple")));
    }

    @Test
    void shouldReturn404ForMissingDevice() throws Exception {
        Long deviceId = 999L;
        when(deviceService.getDeviceById(deviceId)).thenThrow(new ResourceNotFoundException("Device with ID 999 not found"));

        mockMvc.perform(get("/api/devices/{id}", deviceId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Device with ID 999 not found")));
    }

    @Test
    void shouldUpdateDevice() throws Exception {
        Long deviceId = 10L;
        UpdateDeviceRequest request = new UpdateDeviceRequest("Dell", "XPS 15", "XPS-555", DeviceType.LAPTOP, "Silver", "Power brick", "Like new");
        DeviceResponse response = new DeviceResponse(deviceId, 1L, "John Doe", "Dell", "XPS 15", "XPS-555", DeviceType.LAPTOP, "Silver", "Power brick", "Like new", Instant.now(), Instant.now());

        when(deviceService.updateDevice(eq(deviceId), any(UpdateDeviceRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/devices/{id}", deviceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.brand", is("Dell")))
                .andExpect(jsonPath("$.data.model", is("XPS 15")));
    }

    @Test
    void shouldDeleteDevice() throws Exception {
        Long deviceId = 10L;
        doNothing().when(deviceService).deleteDevice(deviceId);

        mockMvc.perform(delete("/api/devices/{id}", deviceId))
                .andExpect(status().isNoContent());

        verify(deviceService, times(1)).deleteDevice(deviceId);
    }
}
