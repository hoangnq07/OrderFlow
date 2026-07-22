package com.training.starter.mapper;

import com.training.starter.dto.response.OrderItemResponse;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.entity.Order;
import com.training.starter.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    OrderResponse toResponse(Order order);

    OrderItemResponse toItemResponse(OrderItem orderItem);
}
