package com.berke.cra.minidesk.repairorder;

import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.device.Device;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.device.DeviceType;
import com.berke.cra.minidesk.testsupport.PostgresTestContainerConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@Import(PostgresTestContainerConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class RepairOrderSpecificationsIntegrationTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private RepairOrderRepository repairOrderRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Customer customer1;
    private Customer customer2;
    private Device device1;
    private Device device2;

    private RepairOrder order1;
    private RepairOrder order2;
    private RepairOrder order3;

    @BeforeEach
    void setUp() {
        repairOrderRepository.deleteAllInBatch();
        deviceRepository.deleteAllInBatch();
        customerRepository.deleteAllInBatch();

        customer1 = customerRepository.save(new Customer("John Doe", "john@example.com", "111", "Notes A"));
        customer2 = customerRepository.save(new Customer("Jane Smith", "jane@example.com", "222", "Notes B"));

        device1 = deviceRepository.save(new Device(customer1, "Apple", "MacBook Pro", "SERIAL-111", DeviceType.LAPTOP, "Gray", "Adapter", "Good"));
        device2 = deviceRepository.save(new Device(customer2, "Dell", "Latitude", "SERIAL-222", DeviceType.LAPTOP, "Black", "Charger", "Good"));

        // Order 1: customer 1, device 1, received 2026-07-10T12:00:00Z
        order1 = repairOrderRepository.save(new RepairOrder(
                "CRA-20260710-001", device1, "Keyboard keys sticking", "Sticking", "Cleaned",
                RepairOrderStatus.IN_REPAIR, RepairPriority.HIGH, new BigDecimal("100.00"), new BigDecimal("0.00"),
                Instant.parse("2026-07-10T12:00:00Z")
        ));
        setCreatedAt(order1.getId(), Instant.parse("2026-07-10T12:00:00Z"));

        // Order 2: customer 2, device 2, received 2026-07-12T12:00:00Z
        order2 = repairOrderRepository.save(new RepairOrder(
                "CRA-20260712-002", device2, "Screen flicker issue", "Flicker", "Replaced cable",
                RepairOrderStatus.RECEIVED, RepairPriority.NORMAL, new BigDecimal("200.00"), new BigDecimal("0.00"),
                Instant.parse("2026-07-12T12:00:00Z")
        ));
        setCreatedAt(order2.getId(), Instant.parse("2026-07-12T12:00:00Z"));

        // Order 3: customer 1, device 1, received 2026-07-15T12:00:00Z
        order3 = repairOrderRepository.save(new RepairOrder(
                "CRA-20260715-003", device1, "Battery won't charge % test", "Battery dead", "Replaced",
                RepairOrderStatus.COMPLETED, RepairPriority.HIGH, new BigDecimal("150.00"), new BigDecimal("150.00"),
                Instant.parse("2026-07-15T12:00:00Z")
        ));
        setCreatedAt(order3.getId(), Instant.parse("2026-07-15T12:00:00Z"));
    }

    private void setCreatedAt(Long orderId, Instant createdAt) {
        jdbcTemplate.update("UPDATE repair_orders SET created_at = ? WHERE id = ?", Timestamp.from(createdAt), orderId);
    }

    @Test
    void shouldFindOrderByOrderNumber() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "CRA-20260710-001", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260710-001", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldFindOrderByCustomerFullNameJoin() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "Jane Smith", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260712-002", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldFindOrderByDeviceBrandJoin() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "Dell", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260712-002", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldFindOrderByDeviceModelJoin() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "MacBook", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void shouldFindOrderByDeviceSerialNumberJoin() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "SERIAL-111", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void shouldFindOrderByReportedIssue() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "flicker", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260712-002", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldFilterByStatus() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, RepairOrderStatus.IN_REPAIR, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260710-001", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldFilterByPriority() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, RepairPriority.HIGH, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void shouldFilterByCustomerId() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, null, customer1.getId(), null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void shouldFilterByDeviceId() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, null, null, device2.getId(), null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260712-002", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldFilterWithCreatedFromInclusive() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, null, null, null, Instant.parse("2026-07-12T12:00:00Z"), null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements()); // 12th and 15th
    }

    @Test
    void shouldFilterWithCreatedToExclusive() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, null, null, null, null, Instant.parse("2026-07-12T12:00:00Z")
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements()); // 10th
    }

    @Test
    void shouldFilterWithBothDatesCombined() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, null, null, null, Instant.parse("2026-07-10T12:00:00Z"), Instant.parse("2026-07-15T12:00:00Z")
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements()); // 10th and 12th
    }

    @Test
    void shouldCombineStatusAndPriorityWithAndSemantics() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, RepairOrderStatus.IN_REPAIR, RepairPriority.HIGH, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260710-001", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldCombineAllSearchFiltersTogether() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "Apple", RepairOrderStatus.COMPLETED, RepairPriority.HIGH, customer1.getId(), device1.getId(),
                Instant.parse("2026-07-14T00:00:00Z"), Instant.parse("2026-07-16T00:00:00Z")
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260715-003", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldMatchLiteralPercentWithoutActingAsWildcard() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "%", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("CRA-20260715-003", result.getContent().get(0).getOrderNumber());
    }

    @Test
    void shouldMatchLiteralUnderscoreWithoutActingAsWildcard() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                "_", null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(0, result.getTotalElements()); // No literal underscore exists
    }

    @Test
    void shouldExecuteSortingCorrectly() {
        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
                null, null, null, null, null, null, null
        );
        Page<RepairOrder> result = repairOrderRepository.findAll(
                spec,
                PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "receivedAt"))
        );
        assertEquals(3, result.getTotalElements());
        assertEquals("CRA-20260715-003", result.getContent().get(0).getOrderNumber());
        assertEquals("CRA-20260712-002", result.getContent().get(1).getOrderNumber());
        assertEquals("CRA-20260710-001", result.getContent().get(2).getOrderNumber());
    }
}
