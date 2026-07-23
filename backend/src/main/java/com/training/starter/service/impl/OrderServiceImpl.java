package com.training.starter.service.impl;

import com.training.starter.common.PageResponse;
import com.training.starter.dto.request.CreateOrderRequest;
import com.training.starter.dto.request.UpdateOrderStatusRequest;
import com.training.starter.dto.response.CartItemResponse;
import com.training.starter.dto.response.CartResponse;
import com.training.starter.dto.response.DashboardStatsResponse;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.entity.Order;
import com.training.starter.entity.OrderItem;
import com.training.starter.entity.Product;
import com.training.starter.entity.User;
import com.training.starter.enums.OrderStatus;
import com.training.starter.enums.Role;
import com.training.starter.event.OrderCreatedEvent;
import com.training.starter.exception.BadRequestException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.mapper.OrderMapper;
import com.training.starter.publisher.OrderEventPublisher;
import com.training.starter.repository.OrderRepository;
import com.training.starter.repository.ProductRepository;
import com.training.starter.repository.UserRepository;
import com.training.starter.service.CartService;
import com.training.starter.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final OrderMapper orderMapper;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        CartResponse cart = cartService.getCart(userId);
        if (cart == null || cart.items().isEmpty()) {
            throw new BadRequestException("Shopping cart is empty");
        }

        // 1. Sort Product IDs ascending to prevent database deadlocks
        List<Long> productIds = cart.items().stream()
                .map(CartItemResponse::productId)
                .sorted()
                .toList();

        // 2. Lock products with PESSIMISTIC_WRITE
        List<Product> lockedProducts = productRepository.findAllByIdInForUpdate(productIds);
        Map<Long, Product> productMap = lockedProducts.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        // 3. Validate existence, active status, and stock availability
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (CartItemResponse item : cart.items()) {
            Product product = productMap.get(item.productId());
            if (product == null || !product.isActive()) {
                throw new BadRequestException("Product is unavailable: " + item.productName());
            }

            if (product.getStock() < item.quantity()) {
                throw new BadRequestException(String.format("Insufficient stock for product %s (Available: %d, Requested: %d)",
                        product.getName(), product.getStock(), item.quantity()));
            }

            // 4. Decrease stock
            product.setStock(product.getStock() - item.quantity());
            productRepository.save(product);

            // 5. Build OrderItem with snapshot values
            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
            calculatedTotal = calculatedTotal.add(itemSubtotal);

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(item.quantity())
                    .subtotal(itemSubtotal)
                    .build();
            orderItems.add(orderItem);
        }

        // 6. Build and save Order
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .totalAmount(calculatedTotal)
                .shippingAddress(request.shippingAddress())
                .note(request.note())
                .build();

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);

        // 7. Clear user's cart in Redis
        cartService.clearCart(userId);

        // 8. Publish OrderCreatedEvent to RabbitMQ
        List<OrderCreatedEvent.OrderItemInfo> eventItems = savedOrder.getItems().stream()
                .map(i -> new OrderCreatedEvent.OrderItemInfo(
                        i.getProductId(),
                        i.getProductName(),
                        i.getUnitPrice(),
                        i.getQuantity(),
                        i.getSubtotal()
                ))
                .toList();

        OrderCreatedEvent event = new OrderCreatedEvent(
                UUID.randomUUID().toString(),
                savedOrder.getId(),
                userId,
                savedOrder.getTotalAmount(),
                LocalDateTime.now(),
                eventItems
        );
        orderEventPublisher.publishOrderCreatedEvent(event);

        log.info("Order created successfully: orderId={}, userId={}, totalAmount={}", savedOrder.getId(), userId, calculatedTotal);
        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        Page<Order> page = orderRepository.findByUserId(userId, pageable);
        return PageResponse.from(page, orderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getUserOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view this order");
        }

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelUserOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot cancel order in status " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        Order savedOrder = orderRepository.save(order);
        log.info("User cancelled order {}: stock restored", orderId);
        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long totalProducts = productRepository.countByActiveTrue();
        long totalCustomers = userRepository.countByRole(Role.USER);

        return new DashboardStatsResponse(
                totalOrders,
                totalRevenue,
                pendingOrders,
                completedOrders,
                totalProducts,
                totalCustomers
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAdminOrders(OrderStatus status, Pageable pageable) {
        Page<Order> page = (status != null)
                ? orderRepository.findAllByStatus(status, pageable)
                : orderRepository.findAll(pageable);

        return PageResponse.from(page, orderMapper::toResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatusByAdmin(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        validateStatusTransition(order.getStatus(), request.status());

        log.info("Admin updating order {} status from {} to {}", orderId, order.getStatus(), request.status());
        order.setStatus(request.status());
        if (request.note() != null && !request.note().isBlank()) {
            order.setNote(request.note());
        }

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder);
    }

    public void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }

        boolean isValid = switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PROCESSING || newStatus == OrderStatus.CANCELLED;
            case PROCESSING -> newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.CANCELLED;
            case SHIPPED -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!isValid) {
            throw new BadRequestException(
                    String.format("Cannot transition order status from %s to %s", currentStatus, newStatus)
            );
        }
    }
}
