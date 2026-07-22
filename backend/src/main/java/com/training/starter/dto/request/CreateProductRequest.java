package com.training.starter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "Request payload for creating a product")
public record CreateProductRequest(
        @Schema(description = "Product display name", example = "Smartphone Pro 15")
        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String name,

        @Schema(description = "Unique product URL slug", example = "smartphone-pro-15")
        @NotBlank(message = "Product slug is required")
        @Size(max = 255, message = "Product slug must not exceed 255 characters")
        String slug,

        @Schema(description = "Detailed product description", example = "Latest model with high-end camera and battery life")
        String description,

        @Schema(description = "Unit price of the product", example = "999.99")
        @NotNull(message = "Product price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Product price must be non-negative")
        BigDecimal price,

        @Schema(description = "Initial stock quantity", example = "50")
        @NotNull(message = "Product stock is required")
        @Min(value = 0, message = "Product stock must be non-negative")
        Integer stock,

        @Schema(description = "ID of the category this product belongs to", example = "1")
        @NotNull(message = "Category ID is required")
        Long categoryId,

        @Schema(description = "URL of the product image", example = "https://example.com/images/phone.jpg")
        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl
) {}
