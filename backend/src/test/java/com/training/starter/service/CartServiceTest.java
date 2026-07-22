package com.training.starter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.starter.dto.request.AddToCartRequest;
import com.training.starter.dto.response.CartItemResponse;

import com.training.starter.entity.Category;
import com.training.starter.entity.Product;
import com.training.starter.exception.BadRequestException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.repository.ProductRepository;
import com.training.starter.service.impl.CartServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private CartServiceImpl cartService;

    @Test
    void getCart_emptyCart_returnsEmptyCartResponse() {
        // Given
        Long userId = 1L;
        String key = "cart:1";
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(hashOperations.entries(key)).thenReturn(Map.of());

        // When
        var response = cartService.getCart(userId);

        // Then
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.items()).isEmpty();
        assertThat(response.totalAmount()).isEqualTo(BigDecimal.ZERO);
        assertThat(response.totalItems()).isEqualTo(0);
        verify(redisTemplate).expire(key, 7, TimeUnit.DAYS);
    }

    @Test
    void addItem_validProduct_addsToCartAndRefreshesTtl() {
        // Given
        Long userId = 1L;
        Long productId = 10L;
        String key = "cart:1";
        var request = new AddToCartRequest(productId, 2);
        var product = buildProduct(productId, "Product 1", "product-1", BigDecimal.valueOf(50), 10, true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(hashOperations.get(key, "10")).thenReturn(null);
        when(hashOperations.entries(key)).thenReturn(Map.of());

        // When
        var response = cartService.addItem(userId, request);

        // Then
        assertThat(response.userId()).isEqualTo(userId);
        verify(hashOperations).put(eq(key), eq("10"), any(CartItemResponse.class));
        verify(redisTemplate).expire(key, 7, TimeUnit.DAYS);
    }

    @Test
    void addItem_inactiveProduct_throwsBadRequestException() {
        // Given
        Long userId = 1L;
        Long productId = 10L;
        var request = new AddToCartRequest(productId, 1);
        var product = buildProduct(productId, "Product 1", "product-1", BigDecimal.valueOf(50), 10, false);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        // When & Then
        assertThatThrownBy(() -> cartService.addItem(userId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    void addItem_insufficientStock_throwsBadRequestException() {
        // Given
        Long userId = 1L;
        Long productId = 10L;
        var request = new AddToCartRequest(productId, 20);
        var product = buildProduct(productId, "Product 1", "product-1", BigDecimal.valueOf(50), 5, true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        when(hashOperations.get("cart:1", "10")).thenReturn(null);

        // When & Then
        assertThatThrownBy(() -> cartService.addItem(userId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("exceeds available stock");
    }

    @Test
    void removeItem_deletesHashKeyAndRefreshesTtl() {
        // Given
        Long userId = 1L;
        Long productId = 10L;
        String key = "cart:1";
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);

        // When
        cartService.removeItem(userId, productId);

        // Then
        verify(hashOperations).delete(key, "10");
        verify(redisTemplate).expire(key, 7, TimeUnit.DAYS);
    }

    @Test
    void clearCart_deletesRedisKey() {
        // Given
        Long userId = 1L;
        String key = "cart:1";

        // When
        cartService.clearCart(userId);

        // Then
        verify(redisTemplate).delete(key);
    }

    private Product buildProduct(Long id, String name, String slug, BigDecimal price, int stock, boolean active) {
        Category category = Category.builder().name("Cat").slug("cat").build();
        category.setId(1L);

        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .price(price)
                .stock(stock)
                .category(category)
                .active(active)
                .build();
        product.setId(id);
        return product;
    }
}
