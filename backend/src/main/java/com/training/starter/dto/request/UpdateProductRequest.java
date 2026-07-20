package com.training.starter.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProductRequest(
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String name,

        @Size(max = 255, message = "Product slug must not exceed 255 characters")
        String slug,

        String description,

        @DecimalMin(value = "0.0", inclusive = true, message = "Product price must be non-negative")
        BigDecimal price,

        @Min(value = 0, message = "Product stock must be non-negative")
        Integer stock,

        Long categoryId,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl,

        Boolean active
) {}
