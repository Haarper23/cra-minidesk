package com.berke.cra.minidesk.repairorder;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import com.berke.cra.minidesk.device.Device;
import com.berke.cra.minidesk.customer.Customer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class RepairOrderSpecifications {

    private RepairOrderSpecifications() {
    }

    public static Specification<RepairOrder> filterRepairOrders(
            String query,
            RepairOrderStatus status,
            RepairPriority priority,
            Long customerId,
            Long deviceId,
            Instant createdFrom,
            Instant createdTo) {

        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (deviceId != null) {
                predicates.add(cb.equal(root.get("device").get("id"), deviceId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("device").get("customer").get("id"), customerId));
            }
            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
            }
            if (createdTo != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), createdTo));
            }

            if (query != null && !query.trim().isEmpty()) {
                String trimmed = query.trim();
                String escaped = escapeLikeQuery(trimmed).toLowerCase(java.util.Locale.ROOT);
                String pattern = "%" + escaped + "%";

                Join<RepairOrder, Device> deviceJoin = root.join("device", JoinType.LEFT);
                Join<Device, Customer> customerJoin = deviceJoin.join("customer", JoinType.LEFT);

                criteriaQuery.distinct(true);

                Predicate orderNumberLike = cb.like(cb.lower(root.get("orderNumber")), pattern, '\\');
                Predicate reportedIssueLike = cb.like(cb.lower(root.get("reportedIssue")), pattern, '\\');
                Predicate deviceBrandLike = cb.like(cb.lower(deviceJoin.get("brand")), pattern, '\\');
                Predicate deviceModelLike = cb.like(cb.lower(deviceJoin.get("model")), pattern, '\\');
                Predicate deviceSerialLike = cb.like(cb.lower(deviceJoin.get("serialNumber")), pattern, '\\');
                Predicate customerNameLike = cb.like(cb.lower(customerJoin.get("fullName")), pattern, '\\');

                predicates.add(cb.or(
                    orderNumberLike,
                    reportedIssueLike,
                    deviceBrandLike,
                    deviceModelLike,
                    deviceSerialLike,
                    customerNameLike
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String escapeLikeQuery(String query) {
        return query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");
    }
}
