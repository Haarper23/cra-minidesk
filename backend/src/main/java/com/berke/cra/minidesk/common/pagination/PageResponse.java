package com.berke.cra.minidesk.common.pagination;

import org.springframework.data.domain.Page;
import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last,
    boolean hasNext,
    boolean hasPrevious
) {
    public static <T> PageResponse<T> fromPage(Page<T> springPage) {
        return new PageResponse<>(
            springPage.getContent(),
            springPage.getNumber(),
            springPage.getSize(),
            springPage.getTotalElements(),
            springPage.getTotalPages(),
            springPage.isFirst(),
            springPage.isLast(),
            springPage.hasNext(),
            springPage.hasPrevious()
        );
    }

    public static <S, T> PageResponse<T> fromPage(Page<S> springPage, Function<S, T> converter) {
        List<T> convertedContent = springPage.getContent().stream()
            .map(converter)
            .toList();
        return new PageResponse<>(
            convertedContent,
            springPage.getNumber(),
            springPage.getSize(),
            springPage.getTotalElements(),
            springPage.getTotalPages(),
            springPage.isFirst(),
            springPage.isLast(),
            springPage.hasNext(),
            springPage.hasPrevious()
        );
    }
}
