package com.berke.cra.minidesk.health;

import com.berke.cra.minidesk.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        ApiResponse<Map<String, String>> response = new ApiResponse<>(
            true,
            "CRA MiniDesk backend is running",
            Map.of("status", "UP")
        );
        return ResponseEntity.ok(response);
    }
}
