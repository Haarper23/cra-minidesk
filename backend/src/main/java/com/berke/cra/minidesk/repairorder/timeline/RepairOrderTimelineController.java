package com.berke.cra.minidesk.repairorder.timeline;

import com.berke.cra.minidesk.common.ApiResponse;
import com.berke.cra.minidesk.repairorder.timeline.dto.RepairOrderTimelineResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RepairOrderTimelineController {

    private final RepairOrderTimelineService repairOrderTimelineService;

    public RepairOrderTimelineController(RepairOrderTimelineService repairOrderTimelineService) {
        this.repairOrderTimelineService = repairOrderTimelineService;
    }

    @GetMapping("/api/repair-orders/{repairOrderId}/timeline")
    public ResponseEntity<ApiResponse<List<RepairOrderTimelineResponse>>> getTimelineByRepairOrderId(
            @PathVariable Long repairOrderId) {
        List<RepairOrderTimelineResponse> timeline = repairOrderTimelineService.getTimelineByRepairOrderId(repairOrderId);
        ApiResponse<List<RepairOrderTimelineResponse>> response = new ApiResponse<>(
                true,
                "Repair order timeline retrieved successfully",
                timeline
        );
        return ResponseEntity.ok(response);
    }
}
