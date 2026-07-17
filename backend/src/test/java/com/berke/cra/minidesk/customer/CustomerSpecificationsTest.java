package com.berke.cra.minidesk.customer;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomerSpecificationsTest {

    @Test
    @SuppressWarnings("unchecked")
    void shouldReturnNullPredicateForNullOrEmptyQuery() {
        Specification<Customer> specNull = CustomerSpecifications.hasText(null);
        Specification<Customer> specEmpty = CustomerSpecifications.hasText("   ");

        assertNull(specNull.toPredicate(mock(Root.class), mock(CriteriaQuery.class), mock(CriteriaBuilder.class)));
        assertNull(specEmpty.toPredicate(mock(Root.class), mock(CriteriaQuery.class), mock(CriteriaBuilder.class)));
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldBuildPredicateCorrectlyForQuery() {
        Root<Customer> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<String> fullNamePath = mock(Path.class);
        Path<String> emailPath = mock(Path.class);
        Path<String> phonePath = mock(Path.class);

        when(root.<String>get("fullName")).thenReturn(fullNamePath);
        when(root.<String>get("email")).thenReturn(emailPath);
        when(root.<String>get("phoneNumber")).thenReturn(phonePath);

        when(cb.lower(fullNamePath)).thenReturn(fullNamePath);
        when(cb.lower(emailPath)).thenReturn(emailPath);
        when(cb.lower(phonePath)).thenReturn(phonePath);

        Predicate p1 = mock(Predicate.class);
        Predicate p2 = mock(Predicate.class);
        Predicate p3 = mock(Predicate.class);

        when(cb.like(fullNamePath, "%john%", '\\')).thenReturn(p1);
        when(cb.like(emailPath, "%john%", '\\')).thenReturn(p2);
        when(cb.like(phonePath, "%john%", '\\')).thenReturn(p3);

        Predicate orPredicate = mock(Predicate.class);
        when(cb.or(p1, p2, p3)).thenReturn(orPredicate);

        Specification<Customer> spec = CustomerSpecifications.hasText("john");
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(orPredicate, result);
        verify(cb).or(p1, p2, p3);
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldEscapeWildcardsCorrectlyInLikePattern() {
        Root<Customer> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<String> fullNamePath = mock(Path.class);
        Path<String> emailPath = mock(Path.class);
        Path<String> phonePath = mock(Path.class);

        when(root.<String>get("fullName")).thenReturn(fullNamePath);
        when(root.<String>get("email")).thenReturn(emailPath);
        when(root.<String>get("phoneNumber")).thenReturn(phonePath);

        when(cb.lower(fullNamePath)).thenReturn(fullNamePath);
        when(cb.lower(emailPath)).thenReturn(emailPath);
        when(cb.lower(phonePath)).thenReturn(phonePath);

        String expectedPattern = "%john\\_doe\\%test\\\\val%";

        Specification<Customer> spec = CustomerSpecifications.hasText("john_doe%test\\val");
        spec.toPredicate(root, query, cb);

        verify(cb).like(fullNamePath, expectedPattern, '\\');
        verify(cb).like(emailPath, expectedPattern, '\\');
        verify(cb).like(phonePath, expectedPattern, '\\');
    }
}
