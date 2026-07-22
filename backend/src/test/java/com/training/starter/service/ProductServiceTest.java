package com.training.starter.service;

import com.training.starter.dto.request.CreateProductRequest;
import com.training.starter.dto.request.UpdateProductRequest;
import com.training.starter.dto.response.ProductResponse;
import com.training.starter.entity.Category;
import com.training.starter.entity.Product;
import com.training.starter.exception.DuplicateResourceException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.mapper.ProductMapper;
import com.training.starter.repository.CategoryRepository;
import com.training.starter.repository.ProductRepository;
import com.training.starter.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void create_validRequest_returnsProductResponse() {
        // Given
        var request = new CreateProductRequest("Phone", "phone", "Desc", BigDecimal.valueOf(999.99), 10, 1L, "http://img.jpg");
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, category);
        var response = buildProductResponse(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, 1L, "Electronics");

        when(productRepository.existsBySlug("phone")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productMapper.toEntity(request)).thenReturn(product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(response);

        // When
        var result = productService.create(request);

        // Then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Phone");
        assertThat(result.price()).isEqualTo(BigDecimal.valueOf(999.99));
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void create_duplicateSlug_throwsDuplicateResourceException() {
        // Given
        var request = new CreateProductRequest("Phone", "phone", "Desc", BigDecimal.valueOf(999.99), 10, 1L, "http://img.jpg");
        when(productRepository.existsBySlug("phone")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(productRepository, never()).save(any());
    }

    @Test
    void create_categoryNotFound_throwsResourceNotFoundException() {
        // Given
        var request = new CreateProductRequest("Phone", "phone", "Desc", BigDecimal.valueOf(999.99), 10, 99L, "http://img.jpg");
        when(productRepository.existsBySlug("phone")).thenReturn(false);
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(productRepository, never()).save(any());
    }

    @Test
    void getById_found_returnsProductResponse() {
        // Given
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Laptop", "laptop", BigDecimal.valueOf(1499.99), 5, category);
        var response = buildProductResponse(1L, "Laptop", "laptop", BigDecimal.valueOf(1499.99), 5, 1L, "Electronics");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(response);

        // When
        var result = productService.getById(1L);

        // Then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Laptop");
    }

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAll_paginated_returnsProductPage() {
        // Given
        var category = buildCategory(1L, "Electronics", "electronics");
        var p1 = buildProduct(1L, "P1", "p1", BigDecimal.TEN, 5, category);
        var p2 = buildProduct(2L, "P2", "p2", BigDecimal.valueOf(20), 10, category);
        var r1 = buildProductResponse(1L, "P1", "p1", BigDecimal.TEN, 5, 1L, "Electronics");
        var r2 = buildProductResponse(2L, "P2", "p2", BigDecimal.valueOf(20), 10, 1L, "Electronics");

        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(p1, p2), pageable, 2));
        when(productMapper.toResponse(p1)).thenReturn(r1);
        when(productMapper.toResponse(p2)).thenReturn(r2);

        // When
        var result = productService.getAll(pageable);

        // Then
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void update_validRequest_updatesAndReturns() {
        // Given
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Old Phone", "old-phone", BigDecimal.valueOf(500), 10, category);
        var request = new UpdateProductRequest("New Phone", "new-phone", "New Desc", BigDecimal.valueOf(600), 15, 1L, "http://new.jpg", true);
        var response = buildProductResponse(1L, "New Phone", "new-phone", BigDecimal.valueOf(600), 15, 1L, "Electronics");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySlug("new-phone")).thenReturn(false);
        when(productRepository.save(product)).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(response);

        // When
        var result = productService.update(1L, request);

        // Then
        assertThat(result.name()).isEqualTo("New Phone");
        assertThat(result.price()).isEqualTo(BigDecimal.valueOf(600));
        verify(productMapper).updateEntity(product, request);
        verify(productRepository).save(product);
    }

    @Test
    void update_notFound_throwsResourceNotFoundException() {
        // Given
        var request = new UpdateProductRequest("New Phone", "new-phone", "New Desc", BigDecimal.valueOf(600), 15, 1L, "http://new.jpg", true);
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.update(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(productRepository, never()).save(any());
    }

    @Test
    void delete_existingProduct_setsActiveFalse() {
        // Given
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Item", "item", BigDecimal.TEN, 5, category);
        product.setActive(true);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // When
        productService.delete(1L);

        // Then
        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    void delete_notFound_throwsResourceNotFoundException() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.delete(999L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(productRepository, never()).save(any());
    }

    private Category buildCategory(Long id, String name, String slug) {
        Category category = Category.builder().name(name).slug(slug).build();
        category.setId(id);
        return category;
    }

    private Product buildProduct(Long id, String name, String slug, BigDecimal price, int stock, Category category) {
        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .price(price)
                .stock(stock)
                .category(category)
                .active(true)
                .build();
        product.setId(id);
        return product;
    }

    private ProductResponse buildProductResponse(Long id, String name, String slug, BigDecimal price, int stock, Long catId, String catName) {
        return new ProductResponse(
                id, name, slug, "Desc", price, stock, catId, catName, "http://img.jpg", true, 0L, LocalDateTime.now(), LocalDateTime.now()
        );
    }
}
