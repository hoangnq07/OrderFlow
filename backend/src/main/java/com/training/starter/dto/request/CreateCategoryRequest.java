package com.training.starter.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(min = 1, max = 100, message = "Category name must be between 1 and 100 characters")
        String name,

        @NotBlank(message = "Category slug is required")
        @Size(min = 1, max = 100, message = "Category slug must be between 1 and 100 characters")
        String slug
) {}
