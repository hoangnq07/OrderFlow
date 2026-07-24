package com.training.starter.service;

import com.training.starter.dto.request.CreateProductRequest;
import com.training.starter.dto.request.UpdateProductRequest;
import com.training.starter.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductResponse> getAll(Pageable pageable);
    Page<ProductResponse> search(String query, Pageable pageable);
    ProductResponse getById(Long id);
    ProductResponse create(CreateProductRequest request);
    ProductResponse update(Long id, UpdateProductRequest request);
    void delete(Long id);
    boolean decreaseStock(Long productId, Integer quantity);
}
