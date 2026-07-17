package com.berke.cra.minidesk.common.pagination;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PageResponseTest {

    @Test
    void shouldMapSpringPageToPageResponseCorrectly() {
        List<String> content = List.of("A", "B", "C");
        Page<String> springPage = new PageImpl<>(content, PageRequest.of(1, 3), 10);

        PageResponse<String> response = PageResponse.fromPage(springPage);

        assertNotNull(response);
        assertEquals(content, response.content());
        assertEquals(1, response.page());
        assertEquals(3, response.size());
        assertEquals(10L, response.totalElements());
        assertEquals(4, response.totalPages());
        assertFalse(response.first());
        assertFalse(response.last());
        assertTrue(response.hasNext());
        assertTrue(response.hasPrevious());
    }

    @Test
    void shouldMapSpringPageWithConverterCorrectly() {
        List<Integer> content = List.of(1, 2, 3);
        Page<Integer> springPage = new PageImpl<>(content, PageRequest.of(0, 5), 3);

        PageResponse<String> response = PageResponse.fromPage(springPage, String::valueOf);

        assertNotNull(response);
        assertEquals(List.of("1", "2", "3"), response.content());
        assertEquals(0, response.page());
        assertEquals(5, response.size());
        assertEquals(3L, response.totalElements());
        assertEquals(1, response.totalPages());
        assertTrue(response.first());
        assertTrue(response.last());
        assertFalse(response.hasNext());
        assertFalse(response.hasPrevious());
    }

    @Test
    void shouldHandleEmptyPageMetadata() {
        Page<String> springPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);

        PageResponse<String> response = PageResponse.fromPage(springPage);

        assertNotNull(response);
        assertTrue(response.content().isEmpty());
        assertEquals(0, response.page());
        assertEquals(20, response.size());
        assertEquals(0L, response.totalElements());
        assertEquals(0, response.totalPages());
        assertTrue(response.first());
        assertTrue(response.last());
        assertFalse(response.hasNext());
        assertFalse(response.hasPrevious());
    }

    @Test
    void shouldHandleMiddlePageMetadata() {
        List<String> content = List.of("D", "E");
        Page<String> springPage = new PageImpl<>(content, PageRequest.of(1, 2), 6); // page 1 of 3, size 2

        PageResponse<String> response = PageResponse.fromPage(springPage);

        assertNotNull(response);
        assertEquals(content, response.content());
        assertEquals(1, response.page());
        assertEquals(2, response.size());
        assertEquals(6L, response.totalElements());
        assertEquals(3, response.totalPages());
        assertFalse(response.first());
        assertFalse(response.last());
        assertTrue(response.hasNext());
        assertTrue(response.hasPrevious());
    }

    @Test
    void shouldNotExposeEntityWhenConverterIsUsed() {
        class MockEntity {
            final String value = "entity_value";
        }
        class MockDto {
            final String val;
            MockDto(String val) { this.val = val; }
        }

        List<MockEntity> entities = List.of(new MockEntity());
        Page<MockEntity> entityPage = new PageImpl<>(entities, PageRequest.of(0, 10), 1);

        PageResponse<MockDto> response = PageResponse.fromPage(entityPage, e -> new MockDto(e.value));

        assertNotNull(response);
        assertEquals(1, response.content().size());
        // Verify type safety: content is of MockDto, not MockEntity
        Object item = response.content().get(0);
        assertTrue(item instanceof MockDto);
        assertFalse(item instanceof MockEntity);
        assertEquals("entity_value", ((MockDto) item).val);
    }
}
