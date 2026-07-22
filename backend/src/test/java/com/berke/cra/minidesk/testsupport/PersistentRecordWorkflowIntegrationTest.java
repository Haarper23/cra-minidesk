package com.berke.cra.minidesk.testsupport;

import com.berke.cra.minidesk.common.error.ResourceConflictException;
import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.customer.CustomerService;
import com.berke.cra.minidesk.customer.dto.CreateCustomerRequest;
import com.berke.cra.minidesk.customer.dto.CustomerResponse;
import com.berke.cra.minidesk.device.DeviceRepository;
import com.berke.cra.minidesk.device.DeviceService;
import com.berke.cra.minidesk.device.DeviceType;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import com.berke.cra.minidesk.repairorder.RepairOrderService;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import com.berke.cra.minidesk.repairorder.RepairPriority;
import com.berke.cra.minidesk.repairorder.dto.CreateRepairOrderRequest;
import com.berke.cra.minidesk.repairorder.dto.RepairOrderResponse;
import com.berke.cra.minidesk.repairorder.dto.UpdateRepairOrderStatusRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@Transactional
class PersistentRecordWorkflowIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private RepairOrderService repairOrderService;

    @Autowired
    private RepairOrderRepository repairOrderRepository;

    @Test
    @DisplayName("Create customer and read back from database")
    void shouldCreateAndReadBackCustomerPersistedInDatabase() {
        CreateCustomerRequest createReq = new CreateCustomerRequest("Test User", "test.user@example.com", "555-0199", "Test Notes");
        CustomerResponse created = customerService.createCustomer(createReq);

        assertNotNull(created.id());
        assertTrue(customerRepository.existsById(created.id()));

        CustomerResponse fetched = customerService.getCustomerById(created.id());
        assertEquals("Test User", fetched.fullName());
        assertEquals("test.user@example.com", fetched.email());
    }

    @Test
    @DisplayName("Device ownership persistence and customer validation")
    void shouldCreateDeviceLinkedToCustomerAndVerifyOwnership() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Device Owner", "owner@example.com", null, null));
        CreateDeviceRequest deviceReq = new CreateDeviceRequest("Apple", "MacBook Pro", "SN-PERSIST-100", DeviceType.LAPTOP, "Space Gray", "Charger", "Good");

        DeviceResponse device = deviceService.createDevice(customer.id(), deviceReq);

        assertNotNull(device.id());
        assertEquals(customer.id(), device.customerId());
        assertTrue(deviceRepository.existsById(device.id()));
    }

    @Test
    @DisplayName("Rollback/no write on invalid ownership when creating device for non-existent customer")
    void shouldRejectDeviceCreationForNonExistentCustomer() {
        CreateDeviceRequest deviceReq = new CreateDeviceRequest("Dell", "XPS 15", "SN-INVALID-CUST", DeviceType.LAPTOP, null, null, null);

        assertThrows(RuntimeException.class, () -> deviceService.createDevice(999999L, deviceReq));
        assertFalse(deviceRepository.existsBySerialNumberIgnoreCase("SN-INVALID-CUST"));
    }

    @Test
    @DisplayName("Rollback/no write when creating repair order with mismatched customer and device")
    void shouldRejectRepairOrderCreationWhenDeviceDoesNotBelongToCustomer() {
        CustomerResponse customer1 = customerService.createCustomer(new CreateCustomerRequest("Cust 1", "c1@example.com", null, null));
        CustomerResponse customer2 = customerService.createCustomer(new CreateCustomerRequest("Cust 2", "c2@example.com", null, null));

        DeviceResponse device1 = deviceService.createDevice(customer1.id(), new CreateDeviceRequest("HP", "Spectre", "SN-CUST1", DeviceType.LAPTOP, null, null, null));

        CreateRepairOrderRequest roReq = new CreateRepairOrderRequest(
                customer2.id(), // Wrong customer!
                device1.id(),
                "Screen flickering",
                RepairPriority.HIGH,
                null,
                null,
                new BigDecimal("150.00")
        );

        assertThrows(IllegalArgumentException.class, () -> repairOrderService.createRepairOrder(roReq));
    }

    @Test
    @DisplayName("Repair order persistence with customer and device links")
    void shouldCreateRepairOrderAndVerifyCustomerAndDevicePersistence() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("RO Owner", "roowner@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("Lenovo", "ThinkPad", "SN-RO-100", DeviceType.LAPTOP, null, null, null));

        CreateRepairOrderRequest roReq = new CreateRepairOrderRequest(
                customer.id(),
                device.id(),
                "Battery replacement required",
                RepairPriority.NORMAL,
                "Battery health at 50%",
                "Ordered replacement",
                new BigDecimal("200.00")
        );

        RepairOrderResponse ro = repairOrderService.createRepairOrder(roReq);

        assertNotNull(ro.id());
        assertNotNull(ro.orderNumber());
        assertEquals(RepairOrderStatus.RECEIVED, ro.status());
        assertEquals(device.id(), ro.deviceId());
        assertEquals(customer.id(), ro.customerId());

        RepairOrderResponse fetched = repairOrderService.getRepairOrderById(ro.id());
        assertEquals("Battery replacement required", fetched.reportedIssue());
    }

    @Test
    @DisplayName("Rollback/no write on invalid status transition")
    void shouldRejectInvalidStatusTransitionAndKeepOriginalStatus() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Transition User", "trans@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("Asus", "ROG", "SN-TRANS-1", DeviceType.LAPTOP, null, null, null));
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Overheating", RepairPriority.HIGH, null, null, null));

        // Invalid: RECEIVED -> DELIVERED directly
        assertThrows(IllegalArgumentException.class, () ->
                repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DELIVERED))
        );

        RepairOrderResponse afterInvalid = repairOrderService.getRepairOrderById(ro.id());
        assertEquals(RepairOrderStatus.RECEIVED, afterInvalid.status(), "Status must remain unchanged after rejected transition");
    }

    @Test
    @DisplayName("Prohibit deletion of repair order not in RECEIVED or CANCELLED status")
    void shouldProhibitDeletionOfRepairOrderNotInReceivedOrCancelledState() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Del Prohibit User", "delprohibit@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("Acer", "Predator", "SN-DELPRO-1", DeviceType.LAPTOP, null, null, null));
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "No power", RepairPriority.URGENT, null, null, null));

        // Transition to DIAGNOSING
        repairOrderService.updateRepairOrderStatus(ro.id(), new UpdateRepairOrderStatusRequest(RepairOrderStatus.DIAGNOSING));

        // Attempt deletion in DIAGNOSING status
        assertThrows(IllegalArgumentException.class, () -> repairOrderService.deleteRepairOrder(ro.id()));

        assertTrue(repairOrderRepository.existsById(ro.id()), "Repair order in DIAGNOSING status must not be deleted");
    }

    @Test
    @DisplayName("Prohibit deletion of device with linked repair orders")
    void shouldProhibitDeletionOfDeviceWithRepairOrders() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Device Del User", "devdel@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("MSI", "Stealth", "SN-DEVDEL-1", DeviceType.LAPTOP, null, null, null));
        repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Keyboard replacement", RepairPriority.LOW, null, null, null));

        assertThrows(ResourceConflictException.class, () -> deviceService.deleteDevice(device.id()));
        assertTrue(deviceRepository.existsById(device.id()), "Device with repair orders must remain in database");
    }

    @Test
    @DisplayName("Prohibit deletion of customer with linked devices")
    void shouldProhibitDeletionOfCustomerWithDevices() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Cust Del User", "custdel@example.com", null, null));
        deviceService.createDevice(customer.id(), new CreateDeviceRequest("Samsung", "Galaxy Book", "SN-CUSTDEL-1", DeviceType.LAPTOP, null, null, null));

        assertThrows(ResourceConflictException.class, () -> customerService.deleteCustomer(customer.id()));
        assertTrue(customerRepository.existsById(customer.id()), "Customer with devices must remain in database");
    }

    @Test
    @DisplayName("Allowed deletion of repair order, device, and customer in valid order")
    void shouldAllowDeletionOfRepairOrderAndDeviceAndCustomerInAllowedState() {
        CustomerResponse customer = customerService.createCustomer(new CreateCustomerRequest("Clean User", "clean@example.com", null, null));
        DeviceResponse device = deviceService.createDevice(customer.id(), new CreateDeviceRequest("LG", "Gram", "SN-CLEAN-1", DeviceType.LAPTOP, null, null, null));
        RepairOrderResponse ro = repairOrderService.createRepairOrder(new CreateRepairOrderRequest(customer.id(), device.id(), "Initial setup", RepairPriority.LOW, null, null, null));

        // Delete RO (in RECEIVED status)
        repairOrderService.deleteRepairOrder(ro.id());
        assertFalse(repairOrderRepository.existsById(ro.id()));

        // Delete Device (now has 0 repair orders)
        deviceService.deleteDevice(device.id());
        assertFalse(deviceRepository.existsById(device.id()));

        // Delete Customer (now has 0 devices)
        customerService.deleteCustomer(customer.id());
        assertFalse(customerRepository.existsById(customer.id()));
    }
}
