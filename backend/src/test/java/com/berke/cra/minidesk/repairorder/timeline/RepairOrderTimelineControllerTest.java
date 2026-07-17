package com.berke.cra.minidesk.repairorder.timeline;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.timeline.dto.RepairOrderTimelineResponse;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class RepairOrderTimelineControllerTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RepairOrderTimelineService repairOrderTimelineService;

    @Test
    void shouldReturn200ForExistingRepairOrderTimeline() throws Exception {
        Long repairOrderId = 1L;
        RepairOrderTimelineResponse response1 = new RepairOrderTimelineResponse(
                10L, repairOrderId, RepairOrderTimelineEventType.REPAIR_ORDER_CREATED, null, RepairOrderStatus.RECEIVED,
                "Repair order created", null, Instant.now()
        );

        when(repairOrderTimelineService.getTimelineByRepairOrderId(repairOrderId)).thenReturn(List.of(response1));

        mockMvc.perform(get("/api/repair-orders/{repairOrderId}/timeline", repairOrderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Repair order timeline retrieved successfully")))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(10)))
                .andExpect(jsonPath("$.data[0].eventType", is("REPAIR_ORDER_CREATED")));
    }

    @Test
    void shouldReturn404ForMissingRepairOrderTimeline() throws Exception {
        Long repairOrderId = 999L;
        when(repairOrderTimelineService.getTimelineByRepairOrderId(repairOrderId))
                .thenThrow(new ResourceNotFoundException("Repair order with ID 999 not found"));

        mockMvc.perform(get("/api/repair-orders/{repairOrderId}/timeline", repairOrderId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Repair order with ID 999 not found")));
    }

    @Test
    void shouldRejectUnsupportedPostRequest() throws Exception {
        Long repairOrderId = 1L;

        mockMvc.perform(post("/api/repair-orders/{repairOrderId}/timeline", repairOrderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }
}
