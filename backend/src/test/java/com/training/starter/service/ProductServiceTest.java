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
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, category);
        var response = buildProductResponse(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, 1L, "Electronics");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(response);

        var result = productService.getById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Phone");
    }

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAll_returnsPageOfProductResponses() {
        Pageable pageable = PageRequest.of(0, 10);
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, category);
        var response = buildProductResponse(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, 1L, "Electronics");

        when(productRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(product)));
        when(productMapper.toResponse(product)).thenReturn(response);

        var result = productService.getAll(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Phone");
    }

    @Test
    void search_validQuery_returnsMatchingProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, category);
        var response = buildProductResponse(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, 1L, "Electronics");

        when(productRepository.searchProducts("Phone", pageable)).thenReturn(new PageImpl<>(List.of(product)));
        when(productMapper.toResponse(product)).thenReturn(response);

        var result = productService.search("Phone", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Phone");
    }

    @Test
    void update_validRequest_returnsUpdatedResponse() {
        var updateRequest = new UpdateProductRequest("Smart Phone", "smart-phone", "New Desc", BigDecimal.valueOf(899.99), 15, 1L, "http://newimg.jpg", true);
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, category);
        var response = buildProductResponse(1L, "Smart Phone", "smart-phone", BigDecimal.valueOf(899.99), 15, 1L, "Electronics");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySlug("smart-phone")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(response);

        var result = productService.update(1L, updateRequest);

        assertThat(result.name()).isEqualTo("Smart Phone");
        assertThat(result.price()).isEqualTo(BigDecimal.valueOf(899.99));
    }

    @Test
    void delete_existingProduct_setsActiveFalse() {
        var category = buildCategory(1L, "Electronics", "electronics");
        var product = buildProduct(1L, "Phone", "phone", BigDecimal.valueOf(999.99), 10, category);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.delete(1L);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
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
