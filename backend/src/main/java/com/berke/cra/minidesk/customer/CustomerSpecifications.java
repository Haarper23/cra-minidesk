package com.berke.cra.minidesk.customer;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

public final class CustomerSpecifications {

    private CustomerSpecifications() {
    }

    public static Specification<Customer> hasText(String query) {
        return (root, criteriaQuery, cb) -> {
            if (query == null || query.trim().isEmpty()) {
                return null;
            }
            String trimmed = query.trim();
            String escaped = escapeLikeQuery(trimmed).toLowerCase(java.util.Locale.ROOT);
            String pattern = "%" + escaped + "%";

            Predicate nameLike = cb.like(cb.lower(root.get("fullName")), pattern, '\\');
            Predicate emailLike = cb.like(cb.lower(root.get("email")), pattern, '\\');
            Predicate phoneLike = cb.like(cb.lower(root.get("phoneNumber")), pattern, '\\');

            return cb.or(nameLike, emailLike, phoneLike);
        };
    }

    private static String escapeLikeQuery(String query) {
        return query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");
    }
}
