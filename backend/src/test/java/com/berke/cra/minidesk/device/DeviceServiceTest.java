package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DeviceServiceTest {

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private DeviceMapper deviceMapper;

    @InjectMocks
    private DeviceService deviceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldCreateDeviceForCustomer() {
        Long customerId = 1L;
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Notes");
        CreateDeviceRequest request = new CreateDeviceRequest("Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good");
        Device device = new Device(customer, "Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good");
        DeviceResponse response = new DeviceResponse(10L, customerId, "John Doe", "Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good", Instant.now(), Instant.now());

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(deviceRepository.existsBySerialNumberIgnoreCase("XYZ123")).thenReturn(false);
        when(deviceMapper.toEntity(request, customer)).thenReturn(device);
        when(deviceRepository.save(device)).thenReturn(device);
        when(deviceMapper.toResponse(device)).thenReturn(response);

        DeviceResponse result = deviceService.createDevice(customerId, request);

        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("Apple", result.brand());
        assertEquals("MacBook", result.model());
        verify(deviceRepository, times(1)).save(device);
    }

    @Test
    void shouldRejectMissingCustomer() {
        Long customerId = 999L;
        CreateDeviceRequest request = new CreateDeviceRequest("Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good");

        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deviceService.createDevice(customerId, request));
        verify(deviceRepository, never()).save(any());
    }

    @Test
    void shouldRejectDuplicateSerialNumberIfProvided() {
        Long customerId = 1L;
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Notes");
        CreateDeviceRequest request = new CreateDeviceRequest("Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good");

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(deviceRepository.existsBySerialNumberIgnoreCase("XYZ123")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> deviceService.createDevice(customerId, request));
        verify(deviceRepository, never()).save(any());
    }

    @Test
    void shouldAllowBlankOrNullSerialNumber() {
        Long customerId = 1L;
        Customer customer = new Customer("John Doe", "john@example.com", "123456", "Notes");
        CreateDeviceRequest request = new CreateDeviceRequest("Apple", "MacBook", "", DeviceType.LAPTOP, "Silver", "Charger", "Good");
        Device device = new Device(customer, "Apple", "MacBook", "", DeviceType.LAPTOP, "Silver", "Charger", "Good");
        DeviceResponse response = new DeviceResponse(10L, customerId, "John Doe", "Apple", "MacBook", "", DeviceType.LAPTOP, "Silver", "Charger", "Good", Instant.now(), Instant.now());

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(deviceMapper.toEntity(request, customer)).thenReturn(device);
        when(deviceRepository.save(device)).thenReturn(device);
        when(deviceMapper.toResponse(device)).thenReturn(response);

        DeviceResponse result = deviceService.createDevice(customerId, request);

        assertNotNull(result);
        assertEquals("", result.serialNumber());
        verify(deviceRepository, never()).existsBySerialNumberIgnoreCase(any());
    }

    @Test
    void shouldReturnDevicesByCustomerId() {
        Long customerId = 1L;
        Device device = new Device();
        DeviceResponse response = new DeviceResponse(10L, customerId, "John Doe", "Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good", Instant.now(), Instant.now());

        when(customerRepository.existsById(customerId)).thenReturn(true);
        when(deviceRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)).thenReturn(List.of(device));
        when(deviceMapper.toResponse(device)).thenReturn(response);

        List<DeviceResponse> results = deviceService.getDevicesByCustomerId(customerId);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(10L, results.getFirst().id());
    }

    @Test
    void shouldReturnDeviceById() {
        Long deviceId = 10L;
        Device device = new Device();
        DeviceResponse response = new DeviceResponse(deviceId, 1L, "John Doe", "Apple", "MacBook", "XYZ123", DeviceType.LAPTOP, "Silver", "Charger", "Good", Instant.now(), Instant.now());

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(deviceMapper.toResponse(device)).thenReturn(response);

        DeviceResponse result = deviceService.getDeviceById(deviceId);

        assertNotNull(result);
        assertEquals(deviceId, result.id());
    }

    @Test
    void shouldThrowNotFoundForMissingDevice() {
        Long deviceId = 999L;
        when(deviceRepository.findById(deviceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deviceService.getDeviceById(deviceId));
    }

    @Test
    void shouldUpdateDevice() {
        Long deviceId = 10L;
        UpdateDeviceRequest request = new UpdateDeviceRequest("Dell", "XPS", "NEW123", DeviceType.LAPTOP, "Black", "None", "Fair");
        Device device = new Device();
        device.setId(deviceId);
        device.setSerialNumber("OLD123");
        DeviceResponse response = new DeviceResponse(deviceId, 1L, "John Doe", "Dell", "XPS", "NEW123", DeviceType.LAPTOP, "Black", "None", "Fair", Instant.now(), Instant.now());

        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(deviceRepository.findBySerialNumberIgnoreCase("NEW123")).thenReturn(Optional.empty());
        when(deviceRepository.save(device)).thenReturn(device);
        when(deviceMapper.toResponse(device)).thenReturn(response);

        DeviceResponse result = deviceService.updateDevice(deviceId, request);

        assertNotNull(result);
        assertEquals("Dell", result.brand());
        assertEquals("XPS", result.model());
        verify(deviceMapper, times(1)).updateEntity(device, request);
    }

    @Test
    void shouldDeleteDevice() {
        Long deviceId = 10L;
        when(deviceRepository.existsById(deviceId)).thenReturn(true);

        assertDoesNotThrow(() -> deviceService.deleteDevice(deviceId));
        verify(deviceRepository, times(1)).deleteById(deviceId);
    }
}
