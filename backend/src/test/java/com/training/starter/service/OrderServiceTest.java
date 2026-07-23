package com.training.starter.service;

import com.training.starter.dto.request.CreateOrderRequest;
import com.training.starter.dto.response.CartItemResponse;
import com.training.starter.dto.response.CartResponse;
import com.training.starter.dto.response.OrderResponse;
import com.training.starter.entity.Order;
import com.training.starter.entity.OrderItem;
import com.training.starter.entity.Product;
import com.training.starter.entity.User;
import com.training.starter.enums.OrderStatus;
import com.training.starter.enums.Role;
import com.training.starter.event.OrderCreatedEvent;
import com.training.starter.exception.BadRequestException;
import com.training.starter.mapper.OrderMapper;
import com.training.starter.publisher.OrderEventPublisher;
import com.training.starter.repository.OrderRepository;
import com.training.starter.repository.ProductRepository;
import com.training.starter.repository.UserRepository;
import com.training.starter.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartService cartService;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderEventPublisher orderEventPublisher;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User testUser;
    private Product testProduct;
    private CartItemResponse cartItem;
    private CartResponse cartResponse;
    private Order testOrder;
    private OrderResponse testOrderResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .role(Role.USER)
                .build();
        testUser.setId(1L);

        testProduct = Product.builder()
                .name("Test Product")
                .slug("test-product")
                .price(BigDecimal.valueOf(100.00))
                .stock(50)
                .active(true)
                .build();
        testProduct.setId(10L);

        cartItem = new CartItemResponse(
                10L,
                "Test Product",
                "test-product",
                BigDecimal.valueOf(100.00),
                2,
                BigDecimal.valueOf(200.00),
                "http://example.com/img.jpg"
        );

        cartResponse = new CartResponse(1L, List.of(cartItem), BigDecimal.valueOf(200.00), 2);

        testOrder = Order.builder()
                .user(testUser)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(200.00))
                .shippingAddress("123 Main St")
                .createdAt(LocalDateTime.now())
                .build();
        testOrder.setId(100L);

        testOrderResponse = new OrderResponse(
                100L,
                1L,
                "test@example.com",
                BigDecimal.valueOf(200.00),
                OrderStatus.PENDING,
                null,
                List.of(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("createOrder: Valid cart creates order, decreases stock, clears cart, and publishes event")
    void createOrder_validCart_success() {
        CreateOrderRequest request = new CreateOrderRequest("123 Main St", "Leave at door");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cartService.getCart(1L)).thenReturn(cartResponse);
        when(productRepository.findAllByIdInForUpdate(List.of(10L))).thenReturn(List.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(orderMapper.toResponse(testOrder)).thenReturn(testOrderResponse);

        OrderResponse response = orderService.createOrder(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(100L);
        assertThat(testProduct.getStock()).isEqualTo(48);

        verify(cartService).clearCart(1L);
        verify(orderEventPublisher).publishOrderCreatedEvent(any(OrderCreatedEvent.class));
    }

    @Test
    @DisplayName("createOrder: Empty cart throws BadRequestException")
    void createOrder_emptyCart_throwsBadRequestException() {
        CreateOrderRequest request = new CreateOrderRequest("123 Main St", null);
        CartResponse emptyCart = new CartResponse(1L, List.of(), BigDecimal.ZERO, 0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cartService.getCart(1L)).thenReturn(emptyCart);

        assertThatThrownBy(() -> orderService.createOrder(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Shopping cart is empty");

        verify(orderRepository, never()).save(any());
        verify(orderEventPublisher, never()).publishOrderCreatedEvent(any());
    }

    @Test
    @DisplayName("createOrder: Insufficient stock throws BadRequestException")
    void createOrder_insufficientStock_throwsBadRequestException() {
        CreateOrderRequest request = new CreateOrderRequest("123 Main St", null);
        testProduct.setStock(1); // Cart requested 2

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cartService.getCart(1L)).thenReturn(cartResponse);
        when(productRepository.findAllByIdInForUpdate(List.of(10L))).thenReturn(List.of(testProduct));

        assertThatThrownBy(() -> orderService.createOrder(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelUserOrder: Pending order restores stock and updates status to CANCELLED")
    void cancelUserOrder_pendingStatus_restoresStock() {
        OrderItem item = OrderItem.builder()
                .productId(10L)
                .productName("Test Product")
                .quantity(2)
                .unitPrice(BigDecimal.valueOf(100.00))
                .subtotal(BigDecimal.valueOf(200.00))
                .build();
        testOrder.addItem(item);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(testOrder)).thenReturn(testOrder);
        when(orderMapper.toResponse(testOrder)).thenReturn(testOrderResponse);

        OrderResponse response = orderService.cancelUserOrder(1L, 100L);

        assertThat(response).isNotNull();
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(testProduct.getStock()).isEqualTo(52); // Restored 2 items
    }
}
