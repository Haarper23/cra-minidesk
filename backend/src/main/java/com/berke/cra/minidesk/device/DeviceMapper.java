package com.berke.cra.minidesk.device;

import com.berke.cra.minidesk.customer.Customer;
import com.berke.cra.minidesk.device.dto.CreateDeviceRequest;
import com.berke.cra.minidesk.device.dto.DeviceResponse;
import com.berke.cra.minidesk.device.dto.UpdateDeviceRequest;
import org.springframework.stereotype.Component;

@Component
public class DeviceMapper {

    public Device toEntity(CreateDeviceRequest request, Customer customer) {
        if (request == null) {
            return null;
        }
        return new Device(
            customer,
            request.brand(),
            request.model(),
            request.serialNumber(),
            request.deviceType(),
            request.color(),
            request.accessories(),
            request.conditionNotes()
        );
    }

    public DeviceResponse toResponse(Device device) {
        if (device == null) {
            return null;
        }
        return new DeviceResponse(
            device.getId(),
            device.getCustomer().getId(),
            device.getCustomer().getFullName(),
            device.getBrand(),
            device.getModel(),
            device.getSerialNumber(),
            device.getDeviceType(),
            device.getColor(),
            device.getAccessories(),
            device.getConditionNotes(),
            device.getCreatedAt(),
            device.getUpdatedAt()
        );
    }

    public void updateEntity(Device device, UpdateDeviceRequest request) {
        if (device == null || request == null) {
            return;
        }
        device.setBrand(request.brand());
        device.setModel(request.model());
        device.setSerialNumber(request.serialNumber());
        device.setDeviceType(request.deviceType());
        device.setColor(request.color());
        device.setAccessories(request.accessories());
        device.setConditionNotes(request.conditionNotes());
    }
}
