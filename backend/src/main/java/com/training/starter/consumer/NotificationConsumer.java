package com.training.starter.consumer;

import com.training.starter.config.RabbitMQConfig;
import com.training.starter.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void sendOrderConfirmationEmail(OrderCreatedEvent event) {
        log.info("Received Notification Event: eventId={}, orderId={}, userId={}",
                event.eventId(), event.orderId(), event.userId());

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@orderflow.com");
            message.setTo("user" + event.userId() + "@example.com");
            message.setSubject("Order Confirmation - Order #" + event.orderId());

            StringBuilder body = new StringBuilder();
            body.append("Thank you for your order!\n\n");
            body.append("Order ID: ").append(event.orderId()).append("\n");
            body.append("Total Amount: $").append(event.totalAmount()).append("\n\n");
            body.append("Items Ordered:\n");

            if (event.items() != null) {
                for (OrderCreatedEvent.OrderItemInfo item : event.items()) {
                    body.append("- ").append(item.productName())
                        .append(" x").append(item.quantity())
                        .append(" ($").append(item.subtotal()).append(")\n");
                }
            }

            message.setText(body.toString());

            mailSender.send(message);
            log.info("Order confirmation email sent successfully for orderId={}", event.orderId());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for orderId={}: {}", event.orderId(), e.getMessage(), e);
        }
    }
}
