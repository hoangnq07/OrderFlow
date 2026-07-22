package com.training.starter.consumer;

import com.training.starter.event.OrderCreatedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
class PaymentConsumerTest {

    @InjectMocks
    private PaymentConsumer paymentConsumer;

    @Test
    void processPayment_validEvent_executesWithoutException() {
        // Given
        var item = new OrderCreatedEvent.OrderItemInfo(1L, "Smartphone", BigDecimal.valueOf(499.99), 2, BigDecimal.valueOf(999.98));
        var event = new OrderCreatedEvent(
                UUID.randomUUID().toString(),
                101L,
                5L,
                BigDecimal.valueOf(999.98),
                LocalDateTime.now(),
                List.of(item)
        );

        // When & Then
        assertDoesNotThrow(() -> paymentConsumer.processPayment(event));
    }
}
