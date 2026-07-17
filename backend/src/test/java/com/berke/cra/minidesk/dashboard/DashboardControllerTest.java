package com.berke.cra.minidesk.dashboard;

import com.berke.cra.minidesk.dashboard.dto.DashboardResponse;
import com.berke.cra.minidesk.dashboard.dto.RepairStatusCountResponse;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.berke.cra.minidesk.testsupport.PostgresIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class DashboardControllerTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    private DashboardResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockResponse = new DashboardResponse(
            10L,
            15L,
            20L,
            8L,
            3L,
            2L,
            1L,
            4L,
            5L,
            6L,
            List.of(
                new RepairStatusCountResponse(RepairOrderStatus.RECEIVED, 1L),
                new RepairStatusCountResponse(RepairOrderStatus.DIAGNOSING, 0L),
                new RepairStatusCountResponse(RepairOrderStatus.WAITING_FOR_CUSTOMER_APPROVAL, 3L),
                new RepairStatusCountResponse(RepairOrderStatus.APPROVED, 0L),
                new RepairStatusCountResponse(RepairOrderStatus.IN_REPAIR, 0L),
                new RepairStatusCountResponse(RepairOrderStatus.WAITING_FOR_PART, 2L),
                new RepairStatusCountResponse(RepairOrderStatus.COMPLETED, 0L),
                new RepairStatusCountResponse(RepairOrderStatus.READY_FOR_DELIVERY, 1L),
                new RepairStatusCountResponse(RepairOrderStatus.DELIVERED, 10L),
                new RepairStatusCountResponse(RepairOrderStatus.CANCELLED, 2L)
            ),
            Instant.parse("2026-07-17T10:30:00Z")
        );
    }

    @Test
    void shouldReturnHttp200OnGetDashboard() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnResponseUsingApiResponseWrapper() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Dashboard statistics retrieved successfully")))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void shouldReturnResponseContainingCoreCountFields() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.totalCustomers", is(10)))
                .andExpect(jsonPath("$.data.totalDevices", is(15)))
                .andExpect(jsonPath("$.data.totalRepairOrders", is(20)))
                .andExpect(jsonPath("$.data.activeRepairOrders", is(8)))
                .andExpect(jsonPath("$.data.waitingForCustomerApproval", is(3)))
                .andExpect(jsonPath("$.data.waitingForPart", is(2)))
                .andExpect(jsonPath("$.data.readyForDelivery", is(1)))
                .andExpect(jsonPath("$.data.urgentRepairOrders", is(4)))
                .andExpect(jsonPath("$.data.completedToday", is(5)))
                .andExpect(jsonPath("$.data.deliveredToday", is(6)));
    }

    @Test
    void shouldReturnResponseContainingGeneratedAt() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.generatedAt", is("2026-07-17T10:30:00Z")));
    }

    @Test
    void shouldReturnResponseContainingRepairOrdersByStatus() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.repairOrdersByStatus", hasSize(10)));
    }

    @Test
    void shouldPreserveStatusValuesInJson() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.repairOrdersByStatus[0].status", is("RECEIVED")))
                .andExpect(jsonPath("$.data.repairOrdersByStatus[0].count", is(1)))
                .andExpect(jsonPath("$.data.repairOrdersByStatus[2].status", is("WAITING_FOR_CUSTOMER_APPROVAL")))
                .andExpect(jsonPath("$.data.repairOrdersByStatus[2].count", is(3)));
    }

    @Test
    void shouldReturn405ForPostOnDashboard() throws Exception {
        mockMvc.perform(post("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldReturn405ForPutOnDashboard() throws Exception {
        mockMvc.perform(put("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldReturn405ForPatchOnDashboard() throws Exception {
        mockMvc.perform(patch("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldReturn405ForDeleteOnDashboard() throws Exception {
        mockMvc.perform(delete("/api/dashboard"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldReturnSafe500OnServiceException() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenThrow(new RuntimeException("Simulated internal exception"));

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("An unexpected server error occurred")));
    }

    @Test
    void shouldNotExposeInternalExceptionDetailsInErrorResponse() throws Exception {
        when(dashboardService.getDashboardStatistics()).thenThrow(new RuntimeException("Sensitive database schema exception info"));

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(not(containsString("Sensitive database schema exception info"))))
                .andExpect(content().string(not(containsString("java.lang.RuntimeException"))))
                .andExpect(content().string(not(containsString("com.berke.cra"))));
    }
}
