package com.training.starter.service;

import com.training.starter.dto.request.AddToCartRequest;
import com.training.starter.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(Long userId);
    CartResponse addItem(Long userId, AddToCartRequest request);
    CartResponse updateQuantity(Long userId, Long productId, int quantity);
    void removeItem(Long userId, Long productId);
    void clearCart(Long userId);
}
