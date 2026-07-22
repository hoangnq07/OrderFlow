package com.training.starter.service.impl;

import com.training.starter.dto.request.UpdateOrderStatusRequest;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.common.PageResponse;
import com.training.starter.entity.Order;
import com.training.starter.enums.OrderStatus;
import com.training.starter.exception.BadRequestException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.mapper.OrderMapper;
import com.training.starter.repository.OrderRepository;
import com.training.starter.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.training.starter.dto.response.DashboardStatsResponse;
import com.training.starter.enums.Role;
import com.training.starter.repository.ProductRepository;
import com.training.starter.repository.UserRepository;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

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
