package com.berke.cra.minidesk.device;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

public final class DeviceSpecifications {

    private DeviceSpecifications() {
    }

    public static Specification<Device> hasCustomerId(Long customerId) {
        return (root, criteriaQuery, cb) -> cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Device> hasDeviceType(DeviceType deviceType) {
        return (root, criteriaQuery, cb) -> {
            if (deviceType == null) {
                return null;
            }
            return cb.equal(root.get("deviceType"), deviceType);
        };
    }

    public static Specification<Device> hasText(String query) {
        return (root, criteriaQuery, cb) -> {
            if (query == null || query.trim().isEmpty()) {
                return null;
            }
            String trimmed = query.trim();
            String escaped = escapeLikeQuery(trimmed).toLowerCase(java.util.Locale.ROOT);
            String pattern = "%" + escaped + "%";

            Predicate brandLike = cb.like(cb.lower(root.get("brand")), pattern, '\\');
            Predicate modelLike = cb.like(cb.lower(root.get("model")), pattern, '\\');
            Predicate serialLike = cb.like(cb.lower(root.get("serialNumber")), pattern, '\\');
            Predicate colorLike = cb.like(cb.lower(root.get("color")), pattern, '\\');

            return cb.or(brandLike, modelLike, serialLike, colorLike);
        };
    }

    private static String escapeLikeQuery(String query) {
        return query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");
    }
}
