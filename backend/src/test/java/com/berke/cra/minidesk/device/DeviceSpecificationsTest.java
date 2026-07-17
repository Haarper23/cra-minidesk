package com.berke.cra.minidesk.device;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeviceSpecificationsTest {

    @Test
    @SuppressWarnings("unchecked")
    void shouldBuildCustomerIdPredicate() {
        Root<Device> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<Object> customerPath = mock(Path.class);
        Path<Object> customerIdPath = mock(Path.class);

        when(root.get("customer")).thenReturn(customerPath);
        when(customerPath.get("id")).thenReturn(customerIdPath);

        Predicate equalPredicate = mock(Predicate.class);
        when(cb.equal(customerIdPath, 123L)).thenReturn(equalPredicate);

        Specification<Device> spec = DeviceSpecifications.hasCustomerId(123L);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(equalPredicate, result);
        verify(cb).equal(customerIdPath, 123L);
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldBuildDeviceTypePredicate() {
        Root<Device> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<Object> typePath = mock(Path.class);
        when(root.get("deviceType")).thenReturn(typePath);

        Predicate equalPredicate = mock(Predicate.class);
        when(cb.equal(typePath, DeviceType.LAPTOP)).thenReturn(equalPredicate);

        Specification<Device> spec = DeviceSpecifications.hasDeviceType(DeviceType.LAPTOP);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(equalPredicate, result);
        verify(cb).equal(typePath, DeviceType.LAPTOP);
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldReturnNullForNullDeviceType() {
        Specification<Device> spec = DeviceSpecifications.hasDeviceType(null);
        Predicate result = spec.toPredicate(mock(Root.class), mock(CriteriaQuery.class), mock(CriteriaBuilder.class));
        assertNull(result);
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldBuildTextPredicateCorrectly() {
        Root<Device> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<String> brandPath = mock(Path.class);
        Path<String> modelPath = mock(Path.class);
        Path<String> serialPath = mock(Path.class);
        Path<String> colorPath = mock(Path.class);

        when(root.<String>get("brand")).thenReturn(brandPath);
        when(root.<String>get("model")).thenReturn(modelPath);
        when(root.<String>get("serialNumber")).thenReturn(serialPath);
        when(root.<String>get("color")).thenReturn(colorPath);

        when(cb.lower(brandPath)).thenReturn(brandPath);
        when(cb.lower(modelPath)).thenReturn(modelPath);
        when(cb.lower(serialPath)).thenReturn(serialPath);
        when(cb.lower(colorPath)).thenReturn(colorPath);

        Predicate p1 = mock(Predicate.class);
        Predicate p2 = mock(Predicate.class);
        Predicate p3 = mock(Predicate.class);
        Predicate p4 = mock(Predicate.class);

        when(cb.like(brandPath, "%mac%", '\\')).thenReturn(p1);
        when(cb.like(modelPath, "%mac%", '\\')).thenReturn(p2);
        when(cb.like(serialPath, "%mac%", '\\')).thenReturn(p3);
        when(cb.like(colorPath, "%mac%", '\\')).thenReturn(p4);

        Predicate orPredicate = mock(Predicate.class);
        when(cb.or(p1, p2, p3, p4)).thenReturn(orPredicate);

        Specification<Device> spec = DeviceSpecifications.hasText("mac");
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(orPredicate, result);
        verify(cb).or(p1, p2, p3, p4);
    }
}
