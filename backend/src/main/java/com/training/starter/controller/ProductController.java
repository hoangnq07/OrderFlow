package com.training.starter.controller;

import com.training.starter.common.ApiResponse;
import com.training.starter.common.PageResponse;
import com.training.starter.dto.request.CreateProductRequest;
import com.training.starter.dto.request.UpdateProductRequest;
import com.training.starter.dto.response.ProductResponse;
import com.training.starter.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product management APIs")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List all products with pagination")
    public ApiResponse<PageResponse<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        var result = productService.getAll(PageRequest.of(page, size, sort));
        return ApiResponse.success(PageResponse.from(result, r -> r));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ApiResponse<ProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(productService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new product (Admin only)")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return ApiResponse.success("Product created", productService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product (Admin only)")
    public ApiResponse<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ApiResponse.success("Product updated", productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product (Admin only)")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
