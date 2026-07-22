package com.training.starter.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.starter.dto.request.CreateProductRequest;
import com.training.starter.dto.request.UpdateProductRequest;
import com.training.starter.dto.response.ProductResponse;
import com.training.starter.exception.ResourceNotFoundException;
import com.training.starter.security.JwtAuthenticationFilter;
import com.training.starter.security.RateLimitingFilter;
import com.training.starter.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitingFilter rateLimitingFilter;

    @Test
    void getAll_validRequest_returnsPageOfProducts() throws Exception {
        // Given
        var response = new ProductResponse(1L, "Laptop", "laptop", "A laptop", BigDecimal.valueOf(999.99), 10, 1L, "Electronics", "http://example.com/image.png", true, 0L, LocalDateTime.now(), LocalDateTime.now());
        var page = new PageImpl<>(List.of(response), PageRequest.of(0, 20), 1);

        when(productService.getAll(any(Pageable.class))).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/products")
                        .param("page", "0")
                        .param("size", "20")
                        .param("sortBy", "createdAt")
                        .param("sortDir", "DESC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Laptop"))
                .andExpect(jsonPath("$.data.content[0].slug").value("laptop"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    void getById_found_returnsProduct() throws Exception {
        // Given
        var response = new ProductResponse(1L, "Laptop", "laptop", "A laptop", BigDecimal.valueOf(999.99), 10, 1L, "Electronics", "http://example.com/image.png", true, 0L, LocalDateTime.now(), LocalDateTime.now());
        when(productService.getById(1L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/products/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Laptop"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        // Given
        when(productService.getById(999L)).thenThrow(new ResourceNotFoundException("Product", 999L));

        // When & Then
        mockMvc.perform(get("/api/v1/products/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void create_validRequest_returns201AndProduct() throws Exception {
        // Given
        var request = new CreateProductRequest("Laptop", "laptop", "A laptop", BigDecimal.valueOf(999.99), 10, 1L, "http://example.com/image.png");
        var response = new ProductResponse(1L, "Laptop", "laptop", "A laptop", BigDecimal.valueOf(999.99), 10, 1L, "Electronics", "http://example.com/image.png", true, 0L, LocalDateTime.now(), LocalDateTime.now());
        when(productService.create(any(CreateProductRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.message").value("Product created"));
    }

    @Test
    void create_invalidRequest_returns400() throws Exception {
        // Given - empty name & slug
        var request = new CreateProductRequest("", "", "A laptop", BigDecimal.valueOf(-1.0), -1, null, "http://example.com/image.png");

        // When & Then
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void update_validRequest_returns200AndProduct() throws Exception {
        // Given
        var request = new UpdateProductRequest("Laptop Pro", "laptop-pro", "A pro laptop", BigDecimal.valueOf(1299.99), 5, 1L, "http://example.com/image.png", true);
        var response = new ProductResponse(1L, "Laptop Pro", "laptop-pro", "A pro laptop", BigDecimal.valueOf(1299.99), 5, 1L, "Electronics", "http://example.com/image.png", true, 1L, LocalDateTime.now(), LocalDateTime.now());
        when(productService.update(eq(1L), any(UpdateProductRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/v1/products/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Laptop Pro"))
                .andExpect(jsonPath("$.message").value("Product updated"));
    }

    @Test
    void delete_existingProduct_returns204() throws Exception {
        // Given
        doNothing().when(productService).delete(1L);

        // When & Then
        mockMvc.perform(delete("/api/v1/products/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
