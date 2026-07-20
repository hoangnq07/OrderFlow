package com.training.starter.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String name,

        @NotBlank(message = "Product slug is required")
        @Size(max = 255, message = "Product slug must not exceed 255 characters")
        String slug,

        String description,

        @NotNull(message = "Product price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Product price must be non-negative")
        BigDecimal price,

        @NotNull(message = "Product stock is required")
        @Min(value = 0, message = "Product stock must be non-negative")
        Integer stock,

        @NotNull(message = "Category ID is required")
        Long categoryId,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl
) {}
