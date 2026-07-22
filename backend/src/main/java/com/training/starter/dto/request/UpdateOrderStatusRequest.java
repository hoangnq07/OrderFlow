package com.training.starter.dto.request;

import com.training.starter.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Order status is required")
        OrderStatus status,
        String note
) {
}
