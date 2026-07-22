package com.training.starter.service;

import com.training.starter.dto.request.UpdateOrderStatusRequest;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.common.PageResponse;
import com.training.starter.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    PageResponse<OrderResponse> getAdminOrders(OrderStatus status, Pageable pageable);

    OrderResponse updateOrderStatusByAdmin(Long orderId, UpdateOrderStatusRequest request);
}
