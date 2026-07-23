package com.training.starter.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateOrderRequest(
        @NotBlank(message = "Shipping address is required") String shippingAddress,
        String note
) {}
