package com.training.starter.consumer;

import com.training.starter.config.RabbitMQConfig;
import com.training.starter.entity.Order;
import com.training.starter.entity.OrderItem;
import com.training.starter.entity.Product;
import com.training.starter.enums.OrderStatus;
import com.training.starter.event.OrderCreatedEvent;
import com.training.starter.repository.OrderRepository;
import com.training.starter.repository.ProductRepository;
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
    private final ProductRepository productRepository;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.PAYMENT_QUEUE)
    public void processPayment(OrderCreatedEvent event) {
        log.info("Received Payment Event: eventId={}, orderId={}, userId={}, totalAmount={}",
                event.eventId(), event.orderId(), event.userId(), event.totalAmount());

        try {
            // Simulate mock payment gateway verification
            boolean paymentSuccess = simulatePaymentGateway(event);

            Order order = orderRepository.findById(event.orderId()).orElse(null);
            if (order == null) {
                log.warn("Order #{} not found during payment processing", event.orderId());
                return;
            }

            if (paymentSuccess) {
                if (order.getStatus() == OrderStatus.PENDING) {
                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                    log.info("Mock Payment SUCCESSFUL: Order #{} status updated to CONFIRMED", event.orderId());
                }
            } else {
                // Compensating Transaction: Cancel order & Restore product stock
                handlePaymentFailure(order);
            }
        } catch (Exception e) {
            log.error("Payment processing error for orderId={}: {}", event.orderId(), e.getMessage(), e);
            orderRepository.findById(event.orderId()).ifPresent(this::handlePaymentFailure);
        }
    }

    private boolean simulatePaymentGateway(OrderCreatedEvent event) {
        // Mock payment gateway logic: Successful by default
        return true;
    }

    private void handlePaymentFailure(Order order) {
        if (order.getStatus() == OrderStatus.PENDING) {
            log.warn("Mock Payment FAILED for Order #{}: Rolling back and restoring stock", order.getId());
            order.setStatus(OrderStatus.CANCELLED);

            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    product.setStock(product.getStock() + item.getQuantity());
                    productRepository.save(product);
                    log.info("Restored stock +{} for product #{} ({})", item.getQuantity(), product.getId(), product.getName());
                }
            }
            orderRepository.save(order);
        }
    }
}
