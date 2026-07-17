package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.customer.CustomerRepository;
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
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@Import(PostgresTestContainerConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class DeviceSpecificationsIntegrationTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    private Customer customer1;
    private Customer customer2;

    @BeforeEach
    void setUp() {
        deviceRepository.deleteAllInBatch();
        customerRepository.deleteAllInBatch();

        customer1 = customerRepository.save(new Customer("Customer One", "one@example.com", "111", "Notes A"));
        customer2 = customerRepository.save(new Customer("Customer Two", "two@example.com", "222", "Notes B"));

        deviceRepository.save(new Device(customer1, "Apple", "MacBook Pro 16", "APPLE-111", DeviceType.LAPTOP, "Space Gray", "Charger", "Good"));
        deviceRepository.save(new Device(customer1, "Apple", "iPad Air", "APPLE-222", DeviceType.TABLET, "Silver", "Cable", "Good"));
        deviceRepository.save(new Device(customer1, "Dell", "Latitude 5420", "DELL-333", DeviceType.LAPTOP, "Black", "Power brick", "Good"));
        deviceRepository.save(new Device(customer1, "Wild_%_Card", "Model_Percent", "SERIAL-%", DeviceType.DESKTOP, "Red", "None", "Good"));

        // Device belonging to customer2
        deviceRepository.save(new Device(customer2, "Apple", "MacBook Air", "APPLE-999", DeviceType.LAPTOP, "Gold", "Charger", "Good"));
    }

    @Test
    void shouldEnforceCustomerOwnershipAndExcludeOtherCustomers() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(4, result.getTotalElements());
        assertTrue(result.getContent().stream().allMatch(d -> d.getCustomer().getId().equals(customer1.getId())));
    }

    @Test
    void shouldFindDeviceByCaseInsensitiveBrand() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasText("aPpLe"));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void shouldFindDeviceByModel() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasText("Latitude"));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("Dell", result.getContent().get(0).getBrand());
    }

    @Test
    void shouldFindDeviceBySerialNumber() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasText("APPLE-222"));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("iPad Air", result.getContent().get(0).getModel());
    }

    @Test
    void shouldFindDeviceByColor() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasText("Space Gray"));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("MacBook Pro 16", result.getContent().get(0).getModel());
    }

    @Test
    void shouldFilterByDeviceType() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasDeviceType(DeviceType.LAPTOP));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void shouldCombineTextAndDeviceTypeWithAndSemantics() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasDeviceType(DeviceType.LAPTOP))
                .and(DeviceSpecifications.hasText("Apple"));
        Page<Device> result = deviceRepository.findAll(spec, PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("APPLE-111", result.getContent().get(0).getSerialNumber());
    }

    @Test
    void shouldMatchLiteralWildcardCharactersLiterally() {
        // Query literal percent "%"
        Specification<Device> specPercent = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasText("%"));
        Page<Device> resultPercent = deviceRepository.findAll(specPercent, PageRequest.of(0, 10));
        assertEquals(1, resultPercent.getTotalElements());
        assertEquals("Wild_%_Card", resultPercent.getContent().get(0).getBrand());

        // Query literal underscore "_"
        Specification<Device> specUnderscore = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()))
                .and(DeviceSpecifications.hasText("_"));
        Page<Device> resultUnderscore = deviceRepository.findAll(specUnderscore, PageRequest.of(0, 10));
        assertEquals(1, resultUnderscore.getTotalElements());
        assertEquals("Wild_%_Card", resultUnderscore.getContent().get(0).getBrand());
    }

    @Test
    void shouldExecutePagingAndSortingCorrectly() {
        Specification<Device> spec = Specification.where(DeviceSpecifications.hasCustomerId(customer1.getId()));
        Page<Device> result = deviceRepository.findAll(
                spec,
                PageRequest.of(0, 2, Sort.by(Sort.Direction.ASC, "brand", "model"))
        );
        assertEquals(4, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        assertEquals("Apple", result.getContent().get(0).getBrand());
        assertEquals("iPad Air", result.getContent().get(0).getModel()); // Sorted lexicographically by brand, model: iPad Air before MacBook Pro 16
        assertEquals("Apple", result.getContent().get(1).getBrand());
        assertEquals("MacBook Pro 16", result.getContent().get(1).getModel());
    }
}
