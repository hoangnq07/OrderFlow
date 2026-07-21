package com.training.starter.controller;

import com.training.starter.common.ApiResponse;
import com.training.starter.dto.request.CreateCategoryRequest;
import com.training.starter.dto.response.CategoryResponse;
import com.training.starter.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all categories")
    public ApiResponse<List<CategoryResponse>> getAll() {
        return ApiResponse.success(categoryService.getAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new category (Admin only)")
    public ApiResponse<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ApiResponse.success("Category created", categoryService.create(request));
    }
}
