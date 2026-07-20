package com.berke.cra.minidesk.config;

import com.berke.cra.minidesk.dashboard.DashboardService;
import com.berke.cra.minidesk.testsupport.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class WebConfigTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    void shouldAllowCorsForDevOriginVite() throws Exception {
        mockMvc.perform(options("/api/dashboard")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"));
    }

    @Test
    void shouldAllowCorsForDevOriginLoopback() throws Exception {
        mockMvc.perform(options("/api/dashboard")
                .header("Origin", "http://127.0.0.1:5173")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5173"));
    }

    @Test
    void shouldAllowCorsForDevOriginTauriLocalhost() throws Exception {
        mockMvc.perform(options("/api/dashboard")
                .header("Origin", "http://tauri.localhost")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://tauri.localhost"));
    }

    @Test
    void shouldAllowCorsForDevOriginTauriScheme() throws Exception {
        mockMvc.perform(options("/api/dashboard")
                .header("Origin", "tauri://localhost")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "tauri://localhost"));
    }

    @Test
    void shouldRejectCorsForUnauthorizedOrigin() throws Exception {
        mockMvc.perform(options("/api/dashboard")
                .header("Origin", "http://malicious-website.com")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}
