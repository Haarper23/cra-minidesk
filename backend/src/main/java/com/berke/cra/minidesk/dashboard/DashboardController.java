package com.berke.cra.minidesk.dashboard;

import com.berke.cra.minidesk.common.ApiResponse;
import com.berke.cra.minidesk.dashboard.dto.DashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardStatistics() {
        DashboardResponse stats = dashboardService.getDashboardStatistics();
        ApiResponse<DashboardResponse> response = new ApiResponse<>(
            true,
            "Dashboard statistics retrieved successfully",
            stats
        );
        return ResponseEntity.ok(response);
    }
}
