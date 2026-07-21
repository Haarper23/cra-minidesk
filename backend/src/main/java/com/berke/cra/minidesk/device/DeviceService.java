package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.common.error.ResourceConflictException;
import com.berke.cra.minidesk.common.error.ResourceNotFoundException;
import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.customer.CustomerRepository;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
import com.berke.cra.minidesk.repairorder.RepairOrderRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final CustomerRepository customerRepository;
    private final DeviceMapper deviceMapper;
    private final RepairOrderRepository repairOrderRepository;

    public DeviceService(
            DeviceRepository deviceRepository,
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
    public com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> searchDevices(
            Long customerId,
            String query,
            DeviceType deviceType,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        if (customerId != null && !customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer with ID " + customerId + " not found");
        }

        java.util.Set<String> allowedFields = java.util.Set.of("id", "brand", "model", "deviceType", "createdAt", "updatedAt");
        org.springframework.data.domain.Pageable pageable = com.berke.cra.minidesk.common.pagination.PaginationUtils.createPageable(
            page, size, sortBy, sortDirection, allowedFields
        );

        org.springframework.data.jpa.domain.Specification<Device> spec = org.springframework.data.jpa.domain.Specification
            .where(customerId != null ? DeviceSpecifications.hasCustomerId(customerId) : null)
            .and(DeviceSpecifications.hasDeviceType(deviceType))
            .and(DeviceSpecifications.hasText(query));

        org.springframework.data.domain.Page<Device> devicePage = deviceRepository.findAll(spec, pageable);

        return com.berke.cra.minidesk.common.pagination.PageResponse.fromPage(devicePage, deviceMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public com.berke.cra.minidesk.common.pagination.PageResponse<DeviceResponse> searchDevicesByCustomer(
            Long customerId,
            String query,
            DeviceType deviceType,
            int page,
            int size,
            String sortBy,
            String sortDirection) {
        return searchDevices(customerId, query, deviceType, page, size, sortBy, sortDirection);
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
            throw new ResourceConflictException("Device cannot be deleted because related repair orders exist");
        }
        try {
            deviceRepository.deleteById(id);
            deviceRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Device cannot be deleted because related repair orders exist");
        }
    }

    // --- Nested customer/device ownership-validated methods ---

    private Device findDeviceWithOwnershipCheck(Long customerId, Long deviceId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer with ID " + customerId + " not found");
        }
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + deviceId + " not found"));
        if (!device.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Device with ID " + deviceId + " not found for customer " + customerId);
        }
        return device;
    }

    @Transactional(readOnly = true)
    public DeviceResponse getDeviceForCustomer(Long customerId, Long deviceId) {
        Device device = findDeviceWithOwnershipCheck(customerId, deviceId);
        return deviceMapper.toResponse(device);
    }

    @Transactional
    public DeviceResponse updateDeviceForCustomer(Long customerId, Long deviceId, UpdateDeviceRequest request) {
        Device device = findDeviceWithOwnershipCheck(customerId, deviceId);

        if (StringUtils.hasText(request.serialNumber())) {
            deviceRepository.findBySerialNumberIgnoreCase(request.serialNumber())
                    .ifPresent(existingDevice -> {
                        if (!existingDevice.getId().equals(deviceId)) {
                            throw new IllegalArgumentException("Device with serial number '" + request.serialNumber() + "' already exists");
                        }
                    });
        }

        deviceMapper.updateEntity(device, request);
        Device updatedDevice = deviceRepository.save(device);
        return deviceMapper.toResponse(updatedDevice);
    }

    @Transactional
    public void deleteDeviceForCustomer(Long customerId, Long deviceId) {
        findDeviceWithOwnershipCheck(customerId, deviceId);

        if (repairOrderRepository.existsByDeviceId(deviceId)) {
            throw new ResourceConflictException("Device cannot be deleted because related repair orders exist");
        }
        try {
            deviceRepository.deleteById(deviceId);
            deviceRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Device cannot be deleted because related repair orders exist");
        }
    }
}
