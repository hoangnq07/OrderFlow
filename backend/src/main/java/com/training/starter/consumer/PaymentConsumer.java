package com.training.starter.consumer;

import com.training.starter.config.RabbitMQConfig;
import com.training.starter.entity.Order;
import com.training.starter.enums.OrderStatus;
import com.training.starter.event.OrderCreatedEvent;
import com.training.starter.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentConsumer {

    private final OrderRepository orderRepository;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.PAYMENT_QUEUE)
    public void processPayment(OrderCreatedEvent event) {
        log.info("Received Payment Event: eventId={}, orderId={}, userId={}, totalAmount={}",
                event.eventId(), event.orderId(), event.userId(), event.totalAmount());

        // Simulate mock payment processing logic
        log.info("Mock Payment SUCCESSFUL for orderId={}", event.orderId());

        orderRepository.findById(event.orderId()).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
                log.info("Order #{} status automatically updated to CONFIRMED after successful payment processing", event.orderId());
            }
        });
    }
}
