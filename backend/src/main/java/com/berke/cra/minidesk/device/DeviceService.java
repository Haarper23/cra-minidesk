package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final CustomerRepository customerRepository;
    private final DeviceMapper deviceMapper;
    private final RepairOrderRepository repairOrderRepository;

    public DeviceService(DeviceRepository deviceRepository,
                         CustomerRepository customerRepository,
                         DeviceMapper deviceMapper,
                         RepairOrderRepository repairOrderRepository) {
        this.deviceRepository = deviceRepository;
        this.customerRepository = customerRepository;
        this.deviceMapper = deviceMapper;
        this.repairOrderRepository = repairOrderRepository;
    }

    @Transactional
    public DeviceResponse createDevice(Long customerId, CreateDeviceRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + customerId + " not found"));

        if (StringUtils.hasText(request.serialNumber())) {
            if (deviceRepository.existsBySerialNumberIgnoreCase(request.serialNumber())) {
                throw new IllegalArgumentException("Device with serial number '" + request.serialNumber() + "' already exists");
            }
        }

        Device device = deviceMapper.toEntity(request, customer);
        Device savedDevice = deviceRepository.save(device);
        return deviceMapper.toResponse(savedDevice);
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> getDevicesByCustomerId(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer with ID " + customerId + " not found");
        }
        return deviceRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(deviceMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeviceResponse getDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + id + " not found"));
        return deviceMapper.toResponse(device);
    }

    @Transactional
    public DeviceResponse updateDevice(Long id, UpdateDeviceRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + id + " not found"));

        if (StringUtils.hasText(request.serialNumber())) {
            deviceRepository.findBySerialNumberIgnoreCase(request.serialNumber())
                    .ifPresent(existingDevice -> {
                        if (!existingDevice.getId().equals(id)) {
                            throw new IllegalArgumentException("Device with serial number '" + request.serialNumber() + "' already exists");
                        }
                    });
        }

        deviceMapper.updateEntity(device, request);
        Device updatedDevice = deviceRepository.save(device);
        return deviceMapper.toResponse(updatedDevice);
    }

    @Transactional
    public void deleteDevice(Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device with ID " + id + " not found");
        }
        if (repairOrderRepository.existsByDeviceId(id)) {
            throw new IllegalArgumentException("Cannot delete device because it has associated repair orders.");
        }
        deviceRepository.deleteById(id);
    }
}
