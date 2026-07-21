package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.common.error.ResourceConflictException;
import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
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
class DeviceControllerTest extends PostgresIntegrationTest {

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
    void shouldGetAllDevicesGlobally() throws Exception {
        DeviceResponse response = new DeviceResponse(10L, 1L, "John Doe", "Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch", Instant.now(), Instant.now());
        com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> pageResponse = new com.berke.cra.minidesk.common.pagination.PageResponse<>(
            List.of(response), 0, 20, 1L, 1, true, true, false, false
        );
        when(deviceService.searchDevices(null, null, null, 0, 20, "createdAt", "desc")).thenReturn(pageResponse);

        mockMvc.perform(get("/api/devices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].brand", is("Apple")));
    }

    @Test
    void shouldGetDevicesByCustomerId() throws Exception {
        Long customerId = 1L;
        DeviceResponse response = new DeviceResponse(10L, customerId, "John Doe", "Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch", Instant.now(), Instant.now());
        com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> pageResponse = new com.berke.cra.minidesk.common.pagination.PageResponse<>(
            List.of(response), 0, 20, 1L, 1, true, true, false, false
        );
        when(deviceService.searchDevicesByCustomer(customerId, null, null, 0, 20, "createdAt", "desc")).thenReturn(pageResponse);

        mockMvc.perform(get("/api/customers/{customerId}/devices", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].brand", is("Apple")));
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

    @Test
    void shouldReturn409ConflictForDeviceDeletionWithRepairOrders() throws Exception {
        Long deviceId = 10L;
        doThrow(new ResourceConflictException("Device cannot be deleted because related repair orders exist"))
                .when(deviceService).deleteDevice(deviceId);

        mockMvc.perform(delete("/api/devices/{id}", deviceId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Device cannot be deleted because related repair orders exist")))
                .andExpect(jsonPath("$.errors", nullValue()));
    }

    @Test
    void shouldReturn400ForInvalidSortingInDevices() throws Exception {
        when(deviceService.searchDevices(any(), any(), any(), anyInt(), anyInt(), eq("invalidField"), any()))
                .thenThrow(new IllegalArgumentException("Sorting by field 'invalidField' is not supported"));

        mockMvc.perform(get("/api/devices").param("sortBy", "invalidField"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Sorting by field 'invalidField' is not supported")));
    }

    @Test
    void shouldReturn400ForInvalidDirectionInDevices() throws Exception {
        when(deviceService.searchDevices(any(), any(), any(), anyInt(), anyInt(), any(), eq("invalidDir")))
                .thenThrow(new IllegalArgumentException("Sort direction 'invalidDir' is not supported"));

        mockMvc.perform(get("/api/devices").param("sortDirection", "invalidDir"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Sort direction 'invalidDir' is not supported")));
    }

    @Test
    void shouldReturn400ForNegativePageInDevices() throws Exception {
        when(deviceService.searchDevices(any(), any(), any(), eq(-1), anyInt(), any(), any()))
                .thenThrow(new IllegalArgumentException("Page index must not be negative"));

        mockMvc.perform(get("/api/devices").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Page index must not be negative")));
    }

    @Test
    void shouldReturn400ForZeroSizeInDevices() throws Exception {
        when(deviceService.searchDevices(any(), any(), any(), anyInt(), eq(0), any(), any()))
                .thenThrow(new IllegalArgumentException("Page size must not be less than 1"));

        mockMvc.perform(get("/api/devices").param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Page size must not be less than 1")));
    }

    @Test
    void shouldReturn400ForLargeSizeInDevices() throws Exception {
        when(deviceService.searchDevices(any(), any(), any(), anyInt(), eq(101), any(), any()))
                .thenThrow(new IllegalArgumentException("Page size must not be greater than 100"));

        mockMvc.perform(get("/api/devices").param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Page size must not be greater than 100")));
    }

    @Test
    void shouldAcceptSearchDeviceQueryParamsAndReturnPageResponse() throws Exception {
        DeviceResponse response = new DeviceResponse(10L, 1L, "Jane Doe", "Apple", "MacBook Pro", "MBP-555", DeviceType.LAPTOP, "Space Gray", "Charger", "Mint", Instant.now(), Instant.now());
        com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> pageResponse = new com.berke.cra.minidesk.common.pagination.PageResponse<>(
            List.of(response), 0, 5, 1L, 1, true, true, false, false
        );

        when(deviceService.searchDevices(eq(1L), eq("MacBook"), eq(DeviceType.LAPTOP), eq(0), eq(5), eq("model"), eq("asc"))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/devices")
                .param("customerId", "1")
                .param("query", "MacBook")
                .param("deviceType", "LAPTOP")
                .param("page", "0")
                .param("size", "5")
                .param("sortBy", "model")
                .param("sortDirection", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].brand", is("Apple")))
                .andExpect(jsonPath("$.data.content[0].model", is("MacBook Pro")))
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(5)))
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.totalPages", is(1)))
                .andExpect(jsonPath("$.data.first", is(true)))
                .andExpect(jsonPath("$.data.last", is(true)))
                .andExpect(jsonPath("$.data.hasNext", is(false)))
                .andExpect(jsonPath("$.data.hasPrevious", is(false)));
    }

    // --- Nested customer/device ownership endpoint tests ---

    @Test
    void shouldReturnDeviceForCorrectCustomerDevicePair() throws Exception {
        Long customerId = 1L;
        Long deviceId = 10L;
        DeviceResponse response = new DeviceResponse(deviceId, customerId, "John Doe", "Apple", "MacBook Air", "MBA-123", DeviceType.LAPTOP, "Midnight", "Charger", "Scratch", Instant.now(), Instant.now());
        when(deviceService.getDeviceForCustomer(customerId, deviceId)).thenReturn(response);

        mockMvc.perform(get("/api/customers/{customerId}/devices/{deviceId}", customerId, deviceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(10)))
                .andExpect(jsonPath("$.data.customerId", is(1)))
                .andExpect(jsonPath("$.data.brand", is("Apple")));
    }

    @Test
    void shouldReturn404ForWrongCustomerDevicePair() throws Exception {
        Long wrongCustomerId = 2L;
        Long deviceId = 10L;
        when(deviceService.getDeviceForCustomer(wrongCustomerId, deviceId))
                .thenThrow(new ResourceNotFoundException("Device with ID 10 not found for customer 2"));

        mockMvc.perform(get("/api/customers/{customerId}/devices/{deviceId}", wrongCustomerId, deviceId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void shouldReturn404ForUpdateWithMismatchedOwnership() throws Exception {
        Long wrongCustomerId = 2L;
        Long deviceId = 10L;
        UpdateDeviceRequest request = new UpdateDeviceRequest("Dell", "XPS 15", "XPS-555", DeviceType.LAPTOP, "Silver", "Power brick", "Like new");
        when(deviceService.updateDeviceForCustomer(eq(wrongCustomerId), eq(deviceId), any(UpdateDeviceRequest.class)))
                .thenThrow(new ResourceNotFoundException("Device with ID 10 not found for customer 2"));

        mockMvc.perform(put("/api/customers/{customerId}/devices/{deviceId}", wrongCustomerId, deviceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void shouldReturn404ForDeleteWithMismatchedOwnership() throws Exception {
        Long wrongCustomerId = 2L;
        Long deviceId = 10L;
        doThrow(new ResourceNotFoundException("Device with ID 10 not found for customer 2"))
                .when(deviceService).deleteDeviceForCustomer(wrongCustomerId, deviceId);

        mockMvc.perform(delete("/api/customers/{customerId}/devices/{deviceId}", wrongCustomerId, deviceId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
