package com.training.starter.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderCreatedEvent(
        String eventId,
        Long orderId,
        Long userId,
        BigDecimal totalAmount,
        LocalDateTime eventTime,
        List<OrderItemInfo> items
) {
    public record OrderItemInfo(
            Long productId,
            String productName,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal subtotal
    ) {}
}
