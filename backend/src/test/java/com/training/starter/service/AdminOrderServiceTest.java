package com.training.starter.service;

import com.training.starter.dto.request.UpdateOrderStatusRequest;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.entity.Order;
import com.training.starter.entity.User;
import com.training.starter.enums.OrderStatus;
import com.training.starter.exception.BadRequestException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.mapper.OrderMapper;
import com.training.starter.repository.OrderRepository;
import com.training.starter.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminOrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User sampleUser;
    private Order sampleOrder;
    private OrderResponse sampleOrderResponse;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .email("user@example.com")
                .password("encoded_pass")
                .build();
        sampleUser.setId(10L);

        sampleOrder = Order.builder()
                .user(sampleUser)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("150.00"))
                .shippingAddress("123 Street")
                .build();
        sampleOrder.setId(1L);

        sampleOrderResponse = new OrderResponse(
                1L, 10L, "user@example.com", new BigDecimal("150.00"),
                OrderStatus.PENDING, null, Collections.emptyList(),
                LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Test
    void getAdminOrders_withStatusFilter_returnsFilteredPage() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(List.of(sampleOrder));

        when(orderRepository.findAllByStatus(OrderStatus.PENDING, pageable)).thenReturn(orderPage);
        when(orderMapper.toResponse(sampleOrder)).thenReturn(sampleOrderResponse);

        // When
        var result = orderService.getAdminOrders(OrderStatus.PENDING, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).status()).isEqualTo(OrderStatus.PENDING);
        verify(orderRepository).findAllByStatus(OrderStatus.PENDING, pageable);
    }

    @Test
    void getAdminOrders_withoutStatusFilter_returnsAllOrdersPage() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(List.of(sampleOrder));

        when(orderRepository.findAll(pageable)).thenReturn(orderPage);
        when(orderMapper.toResponse(sampleOrder)).thenReturn(sampleOrderResponse);

        // When
        var result = orderService.getAdminOrders(null, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        verify(orderRepository).findAll(pageable);
    }

    @Test
    void updateOrderStatusByAdmin_validTransition_updatesAndReturnsOrder() {
        // Given
        var request = new UpdateOrderStatusRequest(OrderStatus.CONFIRMED, "Order confirmed by admin");
        var updatedResponse = new OrderResponse(
                1L, 10L, "user@example.com", new BigDecimal("150.00"),
                OrderStatus.CONFIRMED, "Order confirmed by admin", Collections.emptyList(),
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);
        when(orderMapper.toResponse(sampleOrder)).thenReturn(updatedResponse);

        // When
        OrderResponse result = orderService.updateOrderStatusByAdmin(1L, request);

        // Then
        assertThat(result.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(sampleOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orderRepository).save(sampleOrder);
    }

    @Test
    void updateOrderStatusByAdmin_invalidTransition_throwsBadRequestException() {
        // Given: PENDING to DELIVERED is invalid
        var request = new UpdateOrderStatusRequest(OrderStatus.DELIVERED, "Direct delivery attempt");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.updateOrderStatusByAdmin(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot transition order status from PENDING to DELIVERED");
    }

    @Test
    void updateOrderStatusByAdmin_orderNotFound_throwsResourceNotFoundException() {
        // Given
        var request = new UpdateOrderStatusRequest(OrderStatus.CONFIRMED, "Note");
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> orderService.updateOrderStatusByAdmin(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
