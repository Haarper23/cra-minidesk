package com.berke.cra.minidesk.repairorder;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RepairOrderSpecificationsTest {

    @Test
    @SuppressWarnings("unchecked")
    void shouldBuildEnumAndDatePredicate() {
        Root<RepairOrder> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<Object> statusPath = mock(Path.class);
        Path<Object> priorityPath = mock(Path.class);
        Path<Instant> createdAtPath = mock(Path.class);

        when(root.get("status")).thenReturn(statusPath);
        when(root.get("priority")).thenReturn(priorityPath);
        when(root.<Instant>get("createdAt")).thenReturn(createdAtPath);

        Predicate statusEqual = mock(Predicate.class);
        Predicate priorityEqual = mock(Predicate.class);
        Predicate dateGreater = mock(Predicate.class);
        Predicate dateLess = mock(Predicate.class);

        when(cb.equal(statusPath, RepairOrderStatus.IN_REPAIR)).thenReturn(statusEqual);
        when(cb.equal(priorityPath, RepairPriority.HIGH)).thenReturn(priorityEqual);

        Instant from = Instant.parse("2026-07-01T00:00:00Z");
        Instant to = Instant.parse("2026-08-01T00:00:00Z");

        when(cb.greaterThanOrEqualTo(createdAtPath, from)).thenReturn(dateGreater);
        when(cb.lessThan(createdAtPath, to)).thenReturn(dateLess);

        Predicate combinedPredicate = mock(Predicate.class);
        when(cb.and(any(Predicate[].class))).thenReturn(combinedPredicate);

        Specification<RepairOrder> spec = RepairOrderSpecifications.filterRepairOrders(
            null, RepairOrderStatus.IN_REPAIR, RepairPriority.HIGH, null, null, from, to
        );

        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(combinedPredicate, result);
    }
}
