package com.training.starter.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        Integer stock,
        Long categoryId,
        String categoryName,
        String imageUrl,
        boolean active,
        Long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
