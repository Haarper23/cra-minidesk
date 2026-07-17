package com.berke.cra.minidesk.common.pagination;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class PaginationUtilsTest {

    private final Set<String> allowedFields = Set.of("id", "name", "createdAt");

    @Test
    void shouldCreateValidPageable() {
        Pageable pageable = PaginationUtils.createPageable(0, 20, "createdAt", "desc", allowedFields);

        assertNotNull(pageable);
        assertEquals(0, pageable.getPageNumber());
        assertEquals(20, pageable.getPageSize());
        
        Sort sort = pageable.getSort();
        assertNotNull(sort);
        assertTrue(sort.getOrderFor("createdAt").isDescending());
    }

    @Test
    void shouldAcceptPageZero() {
        Pageable pageable = PaginationUtils.createPageable(0, 10, "id", "asc", allowedFields);
        assertNotNull(pageable);
        assertEquals(0, pageable.getPageNumber());
    }

    @Test
    void shouldRejectNegativePage() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(-1, 20, "createdAt", "desc", allowedFields)
        );
        assertEquals("Page index must not be negative", exception.getMessage());
    }

    @Test
    void shouldAcceptSizeOne() {
        Pageable pageable = PaginationUtils.createPageable(0, 1, "createdAt", "desc", allowedFields);
        assertNotNull(pageable);
        assertEquals(1, pageable.getPageSize());
    }

    @Test
    void shouldAcceptSize100() {
        Pageable pageable = PaginationUtils.createPageable(0, 100, "createdAt", "desc", allowedFields);
        assertNotNull(pageable);
        assertEquals(100, pageable.getPageSize());
    }

    @Test
    void shouldRejectSizeZero() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 0, "createdAt", "desc", allowedFields)
        );
        assertEquals("Page size must not be less than 1", exception.getMessage());
    }

    @Test
    void shouldRejectNegativeSize() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, -5, "createdAt", "desc", allowedFields)
        );
        assertEquals("Page size must not be less than 1", exception.getMessage());
    }

    @Test
    void shouldRejectSize101() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 101, "createdAt", "desc", allowedFields)
        );
        assertEquals("Page size must not be greater than 100", exception.getMessage());
    }

    @Test
    void shouldAcceptAllowedField() {
        Pageable pageable = PaginationUtils.createPageable(0, 20, "name", "desc", allowedFields);
        assertNotNull(pageable);
        assertTrue(pageable.getSort().getOrderFor("name").isDescending());
    }

    @Test
    void shouldRejectUnsupportedField() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 20, "unsupportedField", "desc", allowedFields)
        );
        assertEquals("Sorting by field 'unsupportedField' is not supported", exception.getMessage());
    }

    @Test
    void shouldAcceptAscCaseInsensitively() {
        Pageable pageable1 = PaginationUtils.createPageable(0, 20, "createdAt", "asc", allowedFields);
        Pageable pageable2 = PaginationUtils.createPageable(0, 20, "createdAt", "ASC", allowedFields);

        assertNotNull(pageable1);
        assertTrue(pageable1.getSort().getOrderFor("createdAt").isAscending());
        assertNotNull(pageable2);
        assertTrue(pageable2.getSort().getOrderFor("createdAt").isAscending());
    }

    @Test
    void shouldAcceptDescCaseInsensitively() {
        Pageable pageable1 = PaginationUtils.createPageable(0, 20, "createdAt", "desc", allowedFields);
        Pageable pageable2 = PaginationUtils.createPageable(0, 20, "createdAt", "DESC", allowedFields);

        assertNotNull(pageable1);
        assertTrue(pageable1.getSort().getOrderFor("createdAt").isDescending());
        assertNotNull(pageable2);
        assertTrue(pageable2.getSort().getOrderFor("createdAt").isDescending());
    }

    @Test
    void shouldRejectUnsupportedDirection() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 20, "createdAt", "invalidDir", allowedFields)
        );
        assertEquals("Sort direction 'invalidDir' is not supported", exception.getMessage());
    }

    @Test
    void shouldRejectNullOrBlankSortField() {
        Exception exceptionNull = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 20, null, "desc", allowedFields)
        );
        assertEquals("Sort field must not be empty", exceptionNull.getMessage());

        Exception exceptionBlank = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 20, "   ", "desc", allowedFields)
        );
        assertEquals("Sort field must not be empty", exceptionBlank.getMessage());
    }

    @Test
    void shouldRejectNullOrBlankSortDirection() {
        Exception exceptionNull = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 20, "createdAt", null, allowedFields)
        );
        assertEquals("Sort direction must not be empty", exceptionNull.getMessage());

        Exception exceptionBlank = assertThrows(IllegalArgumentException.class, () ->
            PaginationUtils.createPageable(0, 20, "createdAt", "  ", allowedFields)
        );
        assertEquals("Sort direction must not be empty", exceptionBlank.getMessage());
    }
}
