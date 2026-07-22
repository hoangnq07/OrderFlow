package com.training.starter.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.starter.dto.request.AddToCartRequest;
import com.training.starter.dto.response.CartItemResponse;
import com.training.starter.dto.response.CartResponse;
import com.training.starter.entity.Product;
import com.training.starter.exception.BadRequestException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.repository.ProductRepository;
import com.training.starter.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private static final String CART_KEY_PREFIX = "cart:";
    private static final long CART_TTL_DAYS = 7;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @Override
    public CartResponse getCart(Long userId) {
        String key = getCartKey(userId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);

        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        for (Object value : entries.values()) {
            CartItemResponse item = convertToCartItem(value);
            if (item != null) {
                items.add(item);
                totalAmount = totalAmount.add(item.subtotal());
                totalItems += item.quantity();
            }
        }

        refreshTtl(key);
        return new CartResponse(userId, items, totalAmount, totalItems);
    }

    @Override
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        if (request.quantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.productId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is inactive and cannot be added to cart");
        }

        String key = getCartKey(userId);
        String field = request.productId().toString();
        Object existingValue = redisTemplate.opsForHash().get(key, field);

        int currentQuantity = 0;
        if (existingValue != null) {
            CartItemResponse existingItem = convertToCartItem(existingValue);
            if (existingItem != null) {
                currentQuantity = existingItem.quantity();
            }
        }

        int newQuantity = currentQuantity + request.quantity();
        if (newQuantity > product.getStock()) {
            throw new BadRequestException("Requested quantity (" + newQuantity + ") exceeds available stock (" + product.getStock() + ")");
        }

        BigDecimal unitPrice = product.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(newQuantity));

        CartItemResponse newItem = new CartItemResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                unitPrice,
                newQuantity,
                subtotal,
                product.getImageUrl()
        );

        redisTemplate.opsForHash().put(key, field, newItem);
        return getCart(userId);
    }

    @Override
    public CartResponse updateQuantity(Long userId, Long productId, int quantity) {
        if (quantity <= 0) {
            removeItem(userId, productId);
            return getCart(userId);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        if (!product.isActive()) {
            throw new BadRequestException("Product is inactive");
        }

        if (quantity > product.getStock()) {
            throw new BadRequestException("Requested quantity (" + quantity + ") exceeds available stock (" + product.getStock() + ")");
        }

        String key = getCartKey(userId);
        String field = productId.toString();
        BigDecimal unitPrice = product.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        CartItemResponse updatedItem = new CartItemResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                unitPrice,
                quantity,
                subtotal,
                product.getImageUrl()
        );

        redisTemplate.opsForHash().put(key, field, updatedItem);
        return getCart(userId);
    }

    @Override
    public void removeItem(Long userId, Long productId) {
        String key = getCartKey(userId);
        redisTemplate.opsForHash().delete(key, productId.toString());
        refreshTtl(key);
    }

    @Override
    public void clearCart(Long userId) {
        String key = getCartKey(userId);
        redisTemplate.delete(key);
    }

    private String getCartKey(Long userId) {
        return CART_KEY_PREFIX + userId;
    }

    private void refreshTtl(String key) {
        redisTemplate.expire(key, CART_TTL_DAYS, TimeUnit.DAYS);
    }

    private CartItemResponse convertToCartItem(Object obj) {
        if (obj == null) return null;
        if (obj instanceof CartItemResponse cartItemResponse) {
            return cartItemResponse;
        }
        return objectMapper.convertValue(obj, CartItemResponse.class);
    }
}
