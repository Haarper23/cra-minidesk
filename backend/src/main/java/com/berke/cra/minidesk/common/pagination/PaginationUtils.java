package com.berke.cra.minidesk.common.pagination;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public final class PaginationUtils {

    private PaginationUtils() {
    }

    public static Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String sortDirection,
            Set<String> allowedSortFields) {

        if (page < 0) {
            throw new IllegalArgumentException("Page index must not be negative");
        }
        if (size < 1) {
            throw new IllegalArgumentException("Page size must not be less than 1");
        }
        if (size > 100) {
            throw new IllegalArgumentException("Page size must not be greater than 100");
        }
        if (sortBy == null || sortBy.trim().isEmpty()) {
            throw new IllegalArgumentException("Sort field must not be empty");
        }
        if (!allowedSortFields.contains(sortBy)) {
            throw new IllegalArgumentException("Sorting by field '" + sortBy + "' is not supported");
        }
        if (sortDirection == null || sortDirection.trim().isEmpty()) {
            throw new IllegalArgumentException("Sort direction must not be empty");
        }

        String dirUpper = sortDirection.trim().toUpperCase(java.util.Locale.ROOT);
        if (!"ASC".equals(dirUpper) && !"DESC".equals(dirUpper)) {
            throw new IllegalArgumentException("Sort direction '" + sortDirection + "' is not supported");
        }

        Sort.Direction direction = Sort.Direction.valueOf(dirUpper);
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
}
