package com.training.starter.service;

import com.training.starter.common.PageResponse;
import com.training.starter.dto.request.CreateOrderRequest;
import com.training.starter.dto.request.UpdateOrderStatusRequest;
import com.training.starter.dto.response.DashboardStatsResponse;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponse createOrder(Long userId, CreateOrderRequest request);

    PageResponse<OrderResponse> getUserOrders(Long userId, Pageable pageable);

    OrderResponse getUserOrderById(Long userId, Long orderId);

    OrderResponse cancelUserOrder(Long userId, Long orderId);

    PageResponse<OrderResponse> getAdminOrders(OrderStatus status, Pageable pageable);

    OrderResponse updateOrderStatusByAdmin(Long orderId, UpdateOrderStatusRequest request);

    DashboardStatsResponse getDashboardStats();
}
