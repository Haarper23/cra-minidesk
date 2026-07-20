package com.berke.cra.minidesk.device;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long>, JpaSpecificationExecutor<Device> {
    List<Device> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    boolean existsByCustomerId(Long customerId);
    boolean existsBySerialNumberIgnoreCase(String serialNumber);
    Optional<Device> findBySerialNumberIgnoreCase(String serialNumber);
}
