package com.training.starter.consumer;

import com.training.starter.config.RabbitMQConfig;
import com.training.starter.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentConsumer {

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_QUEUE)
    public void processPayment(OrderCreatedEvent event) {
        log.info("Received Payment Event: eventId={}, orderId={}, userId={}, totalAmount={}",
                event.eventId(), event.orderId(), event.userId(), event.totalAmount());

        // Simulate mock payment processing logic
        log.info("Mock Payment SUCCESSFUL for orderId={}", event.orderId());
    }
}
