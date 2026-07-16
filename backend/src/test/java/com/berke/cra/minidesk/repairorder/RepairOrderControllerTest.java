package com.berke.cra.minidesk.repairorder;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderStatusRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RepairOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RepairOrderService repairOrderService;

    @Test
    void shouldCreateRepairOrder() throws Exception {
        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                1L, "Broken keyboard", RepairPriority.NORMAL, "Diagnosis notes", null, new BigDecimal("100.00")
        );
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-12345678", 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "Broken keyboard", "Diagnosis notes", null, RepairOrderStatus.RECEIVED, RepairPriority.NORMAL,
                new BigDecimal("100.00"), null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.createRepairOrder(any(CreateRepairOrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/repair-orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Repair order created successfully")))
                .andExpect(jsonPath("$.data.id", is(10)))
                .andExpect(jsonPath("$.data.orderNumber", is("CRA-20260716-12345678")));
    }

    @Test
    void shouldRejectCreateRepairOrderWithMissingDeviceId() throws Exception {
        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                null, "Broken keyboard", RepairPriority.NORMAL, null, null, null
        );

        mockMvc.perform(post("/api/repair-orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.deviceId", is("Device ID is required")));

        verify(repairOrderService, never()).createRepairOrder(any());
    }

    @Test
    void shouldRejectCreateRepairOrderWithMissingReportedIssue() throws Exception {
        CreateRepairOrderRequest request = new CreateRepairOrderRequest(
                1L, "", RepairPriority.NORMAL, null, null, null
        );

        mockMvc.perform(post("/api/repair-orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.reportedIssue", is("Reported issue is required")));

        verify(repairOrderService, never()).createRepairOrder(any());
    }

    @Test
    void shouldGetAllRepairOrders() throws Exception {
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-12345678", 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "Broken keyboard", null, null, RepairOrderStatus.RECEIVED, RepairPriority.NORMAL,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.getAllRepairOrders()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/repair-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(10)));
    }

    @Test
    void shouldGetRepairOrderById() throws Exception {
        Long orderId = 10L;
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-12345678", 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "Broken keyboard", null, null, RepairOrderStatus.RECEIVED, RepairPriority.NORMAL,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.getRepairOrderById(orderId)).thenReturn(response);

        mockMvc.perform(get("/api/repair-orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(10)));
    }

    @Test
    void shouldReturn404WhenRepairOrderNotFound() throws Exception {
        Long orderId = 999L;
        when(repairOrderService.getRepairOrderById(orderId))
                .thenThrow(new ResourceNotFoundException("Repair order with ID 999 not found"));

        mockMvc.perform(get("/api/repair-orders/{id}", orderId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Repair order with ID 999 not found")));
    }

    @Test
    void shouldGetRepairOrderByOrderNumber() throws Exception {
        String orderNumber = "CRA-20260716-12345678";
        RepairOrderResponse response = new RepairOrderResponse(
                10L, orderNumber, 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "Broken keyboard", null, null, RepairOrderStatus.RECEIVED, RepairPriority.NORMAL,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.getRepairOrderByOrderNumber(orderNumber)).thenReturn(response);

        mockMvc.perform(get("/api/repair-orders/order-number/{orderNumber}", orderNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderNumber", is(orderNumber)));
    }

    @Test
    void shouldGetRepairOrdersByDevice() throws Exception {
        Long deviceId = 1L;
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-12345678", deviceId, "Dell", "Latitude", 2L, "Jane Doe",
                "Broken keyboard", null, null, RepairOrderStatus.RECEIVED, RepairPriority.NORMAL,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.getRepairOrdersByDeviceId(deviceId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/devices/{deviceId}/repair-orders", deviceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].deviceId", is(1)));
    }

    @Test
    void shouldGetRepairOrdersFilteredByStatus() throws Exception {
        RepairOrderStatus status = RepairOrderStatus.RECEIVED;
        RepairOrderResponse response = new RepairOrderResponse(
                10L, "CRA-20260716-12345678", 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "Broken keyboard", null, null, status, RepairPriority.NORMAL,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.getRepairOrdersByStatus(status)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/repair-orders").param("status", "RECEIVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].status", is("RECEIVED")));
    }

    @Test
    void shouldUpdateRepairOrder() throws Exception {
        Long orderId = 10L;
        UpdateRepairOrderRequest request = new UpdateRepairOrderRequest(
                "New issue", RepairPriority.LOW, "New diagnosis", "New notes", new BigDecimal("120.00"), new BigDecimal("130.00")
        );
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-12345678", 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "New issue", "New diagnosis", "New notes", RepairOrderStatus.RECEIVED, RepairPriority.LOW,
                new BigDecimal("120.00"), new BigDecimal("130.00"), Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.updateRepairOrder(eq(orderId), any(UpdateRepairOrderRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/repair-orders/{id}", orderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.reportedIssue", is("New issue")))
                .andExpect(jsonPath("$.data.priority", is("LOW")));
    }

    @Test
    void shouldPatchValidStatus() throws Exception {
        Long orderId = 10L;
        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING);
        RepairOrderResponse response = new RepairOrderResponse(
                orderId, "CRA-20260716-12345678", 1L, "Dell", "Latitude", 2L, "Jane Doe",
                "Cracked", null, null, RepairOrderStatus.DIAGNOSING, RepairPriority.NORMAL,
                null, null, Instant.now(), null, null, Instant.now(), Instant.now()
        );

        when(repairOrderService.updateRepairOrderStatus(eq(orderId), any(UpdateRepairOrderStatusRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/repair-orders/{id}/status", orderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("DIAGNOSING")));
    }

    @Test
    void shouldReturn400OnPatchMalformedOrInvalidEnum() throws Exception {
        Long orderId = 10L;
        String rawJson = "{\"status\": \"INVALID_ENUM_VALUE\"}";

        mockMvc.perform(patch("/api/repair-orders/{id}/status", orderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid request body or parameter value")));
    }

    @Test
    void shouldReturn400OnPatchInvalidTransition() throws Exception {
        Long orderId = 10L;
        UpdateRepairOrderStatusRequest request = new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED);

        when(repairOrderService.updateRepairOrderStatus(eq(orderId), any(UpdateRepairOrderStatusRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid status transition from RECEIVED to COMPLETED"));

        mockMvc.perform(patch("/api/repair-orders/{id}/status", orderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid status transition from RECEIVED to COMPLETED")));
    }

    @Test
    void shouldDeleteAllowedRepairOrder() throws Exception {
        Long orderId = 10L;
        doNothing().when(repairOrderService).deleteRepairOrder(orderId);

        mockMvc.perform(delete("/api/repair-orders/{id}", orderId))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturn400OnDeleteProtectedRepairOrder() throws Exception {
        Long orderId = 10L;
        doThrow(new IllegalArgumentException("Cannot delete repair order in status IN_REPAIR."))
                .when(repairOrderService).deleteRepairOrder(orderId);

        mockMvc.perform(delete("/api/repair-orders/{id}", orderId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Cannot delete repair order in status IN_REPAIR.")));
    }
}
