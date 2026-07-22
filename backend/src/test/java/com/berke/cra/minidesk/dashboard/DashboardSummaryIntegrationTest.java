package com.berke.cra.minidesk.dashboard;

import com.berke.cra.minidesk.customer.CustomerService;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.dashboard.dto.DashboardSummaryResponse;
import com.berke.cra.minidesk.device.DeviceService;
import com.berke.cra.minidesk.device.DeviceType;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.repairorder.RepairOrderService;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderStatusRequest;
import com.berke.cra.minidesk.testsupport.PostgresIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
class DashboardSummaryIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private RepairOrderService repairOrderService;

    @Test
    @DisplayName("Empty database returns valid zero-filled summary")
    void shouldReturnZeroFilledSummaryWhenDatabaseIsEmpty() {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();

        assertNotNull(summary.generatedAt());
        assertEquals(0L, summary.totals().customers());
        assertEquals(0L, summary.totals().devices());
        assertEquals(0L, summary.totals().repairOrders());
        assertEquals(0L, summary.totals().activeRepairOrders());
        assertEquals(0L, summary.totals().readyForDelivery());
        assertEquals(0L, summary.totals().openedToday());
        assertEquals(0L, summary.totals().deliveredToday());

        assertEquals(10, summary.statusDistribution().size());
        assertTrue(summary.statusDistribution().stream().allMatch(s -> s.count() == 0L));

        assertTrue(summary.recentRepairOrders().isEmpty());
        assertTrue(summary.priorityQueue().isEmpty());
        assertTrue(summary.readyForDeliveryQueue().isEmpty());
        assertTrue(summary.recentActivity().isEmpty());
    }

    @Test
    @DisplayName("GET /api/dashboard/summary returns HTTP 200 with populated data")
    void shouldReturnHttp200AndValidJsonForSummaryEndpoint() throws Exception {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Dash User", "dash@example.com", "555-1111", null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("Apple", "MacBook Air", "SN-DASH-1", DeviceType.LAPTOP, "Silver", null, null));
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Trackpad issue", RepairPriority.URGENT, null, null, new BigDecimal("100.00")));

        mockMvc.perform(get("/api/dashboard/summary").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Dashboard summary retrieved successfully")))
                .andExpect(jsonPath("$.data.totals.customers", equalTo(1)))
                .andExpect(jsonPath("$.data.totals.devices", equalTo(1)))
                .andExpect(jsonPath("$.data.totals.repairOrders", equalTo(1)))
                .andExpect(jsonPath("$.data.totals.activeRepairOrders", equalTo(1)))
                .andExpect(jsonPath("$.data.totals.openedToday", equalTo(1)))
                .andExpect(jsonPath("$.data.statusDistribution", hasSize(10)))
                .andExpect(jsonPath("$.data.priorityQueue", hasSize(1)))
                .andExpect(jsonPath("$.data.priorityQueue[0].priority", is("URGENT")))
                .andExpect(jsonPath("$.data.recentActivity", hasSize(1)));
    }

    @Test
    @DisplayName("Verify status distribution, priority queue, ready queue, and delivered today lifecycle")
    void shouldReflectFullLifecycleInDashboardSummary() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Lifecycle User", "life@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("Dell", "Precision", "SN-LIFE-1", DeviceType.LAPTOP, null, null, null));
        
        // 1. Create RO in RECEIVED status with URGENT priority
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Mainboard short", RepairPriority.URGENT, null, null, new BigDecimal("400.00")));
        
        DashboardSummaryResponse s1 = dashboardService.getDashboardSummary();
        assertEquals(1L, s1.totals().activeRepairOrders());
        assertEquals(1L, s1.totals().openedToday());
        assertEquals(0L, s1.totals().readyForDelivery());
        assertEquals(1, s1.priorityQueue().size());

        // 2. Transition to DIAGNOSING -> IN_REPAIR -> COMPLETED -> READY_FOR_DELIVERY
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.IN_REPAIR));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.READY_FOR_DELIVERY));

        DashboardSummaryResponse s2 = dashboardService.getDashboardSummary();
        assertEquals(1L, s2.totals().readyForDelivery());
        assertEquals(1, s2.readyForDeliveryQueue().size());
        assertEquals("CRA-", s2.readyForDeliveryQueue().get(0).orderNumber().substring(0, 4));

        // 3. Transition to DELIVERED
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DELIVERED));

        DashboardSummaryResponse s3 = dashboardService.getDashboardSummary();
        assertEquals(0L, s3.totals().activeRepairOrders());
        assertEquals(0L, s3.totals().readyForDelivery());
        assertEquals(1L, s3.totals().deliveredToday());
        assertTrue(s3.priorityQueue().isEmpty(), "Delivered orders must be excluded from priority queue");
        assertTrue(s3.readyForDeliveryQueue().isEmpty(), "Delivered orders must be excluded from ready queue");
    }

    @Test
    @DisplayName("Delivered today counts authoritative status transition events without double counting")
    void shouldTrackDeliveredTodayAuthoritativelyWithoutDoubleCounting() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Delivered Test", "deliv@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("Lenovo", "ThinkPad", "SN-DELIV-1", DeviceType.LAPTOP, null, null, null));
        
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Keyboard replacement", RepairPriority.NORMAL, null, null, new BigDecimal("150.00")));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.IN_REPAIR));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.READY_FOR_DELIVERY));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DELIVERED));

        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        assertEquals(1L, summary.totals().deliveredToday(), "Delivered order transition must be counted exactly once");
    }

    @Test
    @DisplayName("Editing repair order details while in READY_FOR_DELIVERY preserves original readySince timestamp")
    void shouldPreserveReadySinceTimestampWhenRepairOrderDetailsAreUpdatedInReadyStatus() throws InterruptedException {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Ready Test", "ready@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("HP", "Spectre", "SN-READY-1", DeviceType.LAPTOP, null, null, null));
        
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Battery swap", RepairPriority.HIGH, null, null, new BigDecimal("200.00")));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.IN_REPAIR));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.COMPLETED));
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.READY_FOR_DELIVERY));

        DashboardSummaryResponse s1 = dashboardService.getDashboardSummary();
        assertFalse(s1.readyForDeliveryQueue().isEmpty());
        java.time.Instant initialReadySince = s1.readyForDeliveryQueue().get(0).readySince();

        Thread.sleep(10); // Small pause to ensure clock tick

        // Update details (e.g. technician notes) while in READY_FOR_DELIVERY
        repairOrderService.updateRepairOrder(ro.id(), new com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderRequest(
            "Battery swap",
            RepairPriority.HIGH,
            "Replaced 60Wh battery",
            "Tested pass",
            new BigDecimal("200.00"),
            new BigDecimal("200.00")
        ));

        DashboardSummaryResponse s2 = dashboardService.getDashboardSummary();
        assertFalse(s2.readyForDeliveryQueue().isEmpty());
        java.time.Instant readySinceAfterEdit = s2.readyForDeliveryQueue().get(0).readySince();

        assertEquals(initialReadySince, readySinceAfterEdit, "readySince must remain fixed to original READY_FOR_DELIVERY transition time even when details are updated");
    }
}
