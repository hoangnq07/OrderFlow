package com.training.starter.service;

import com.training.starter.dto.request.CreateCategoryRequest;
import com.training.starter.dto.request.UpdateCategoryRequest;
import com.training.starter.dto.response.CategoryResponse;
import com.training.starter.entity.Category;
import com.training.starter.exception.DuplicateResourceException;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.mapper.CategoryMapper;
import com.training.starter.repository.CategoryRepository;
import com.training.starter.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void create_validRequest_returnsCategoryResponse() {
        // Given
        var request = new CreateCategoryRequest("Electronics", "electronics");
        var entity = buildCategory(1L, "Electronics", "electronics");
        var response = new CategoryResponse(1L, "Electronics", "electronics", LocalDateTime.now(), LocalDateTime.now());

        when(categoryRepository.existsBySlug("electronics")).thenReturn(false);
        when(categoryMapper.toEntity(request)).thenReturn(entity);
        when(categoryRepository.save(any(Category.class))).thenReturn(entity);
        when(categoryMapper.toResponse(entity)).thenReturn(response);

        // When
        var result = categoryService.create(request);

        // Then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Electronics");
        assertThat(result.slug()).isEqualTo("electronics");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void create_duplicateSlug_throwsDuplicateResourceException() {
        // Given
        var request = new CreateCategoryRequest("Electronics", "electronics");
        when(categoryRepository.existsBySlug("electronics")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void getById_found_returnsCategoryResponse() {
        // Given
        var entity = buildCategory(1L, "Books", "books");
        var response = new CategoryResponse(1L, "Books", "books", LocalDateTime.now(), LocalDateTime.now());

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(categoryMapper.toResponse(entity)).thenReturn(response);

        // When
        var result = categoryService.getById(1L);

        // Then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Books");
    }

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        // Given
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAll_returnsCategoryList() {
        // Given
        var c1 = buildCategory(1L, "Electronics", "electronics");
        var c2 = buildCategory(2L, "Books", "books");
        var r1 = new CategoryResponse(1L, "Electronics", "electronics", LocalDateTime.now(), LocalDateTime.now());
        var r2 = new CategoryResponse(2L, "Books", "books", LocalDateTime.now(), LocalDateTime.now());

        when(categoryRepository.findAll()).thenReturn(List.of(c1, c2));
        when(categoryMapper.toResponse(c1)).thenReturn(r1);
        when(categoryMapper.toResponse(c2)).thenReturn(r2);

        // When
        var results = categoryService.getAll();

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.get(0).name()).isEqualTo("Electronics");
        assertThat(results.get(1).name()).isEqualTo("Books");
    }

    @Test
    void update_validRequest_updatesAndReturns() {
        // Given
        var entity = buildCategory(1L, "Old Name", "old-slug");
        var request = new UpdateCategoryRequest("New Name", "new-slug");
        var updatedResponse = new CategoryResponse(1L, "New Name", "new-slug", LocalDateTime.now(), LocalDateTime.now());

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(categoryRepository.existsBySlug("new-slug")).thenReturn(false);
        when(categoryRepository.save(entity)).thenReturn(entity);
        when(categoryMapper.toResponse(entity)).thenReturn(updatedResponse);

        // When
        var result = categoryService.update(1L, request);

        // Then
        assertThat(result.name()).isEqualTo("New Name");
        assertThat(result.slug()).isEqualTo("new-slug");
        verify(categoryMapper).updateEntity(entity, request);
        verify(categoryRepository).save(entity);
    }

    @Test
    void update_notFound_throwsResourceNotFoundException() {
        // Given
        var request = new UpdateCategoryRequest("New Name", "new-slug");
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.update(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void update_duplicateSlug_throwsDuplicateResourceException() {
        // Given
        var entity = buildCategory(1L, "Category One", "cat-1");
        var request = new UpdateCategoryRequest("Category One Updated", "cat-2");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(categoryRepository.existsBySlug("cat-2")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> categoryService.update(1L, request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void delete_existingCategory_deletesSuccessfully() {
        // Given
        var entity = buildCategory(1L, "Category To Delete", "to-delete");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(entity));

        // When
        categoryService.delete(1L);

        // Then
        verify(categoryRepository).delete(entity);
    }

    @Test
    void delete_notFound_throwsResourceNotFoundException() {
        // Given
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.delete(999L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(categoryRepository, never()).delete(any());
    }

    private Category buildCategory(Long id, String name, String slug) {
        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .build();
        category.setId(id);
        return category;
    }
}
