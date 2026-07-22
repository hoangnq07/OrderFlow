package com.training.starter.integration;

import com.training.starter.BaseIntegrationTest;
import com.training.starter.entity.Category;
import com.training.starter.entity.Product;
import com.training.starter.repository.CategoryRepository;
import com.training.starter.repository.ProductRepository;
import com.training.starter.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class ConcurrentStockLockIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductService productService;

    @Test
    void testConcurrentStockDecrease_PreventsOverselling() throws InterruptedException {
        // Step 1: Create a test category and product with stock = 10
        Category category = new Category();
        category.setName("Concurrent Test Category");
        category.setSlug("concurrent-test-cat");
        category = categoryRepository.save(category);

        Product product = new Product();
        product.setName("Concurrent Lock Item");
        product.setSlug("concurrent-lock-item");
        product.setPrice(new BigDecimal("99.99"));
        product.setStock(10);
        product.setActive(true);
        product.setCategory(category);
        product.setVersion(0L);
        product = productRepository.save(product);

        final Long productId = product.getId();
        int threadCount = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        // Step 2: Spawn 10 concurrent threads attempting to decrease stock by 1 each
        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    startLatch.await(); // Wait for all threads to align
                    boolean result = productService.decreaseStock(productId, 1);
                    if (result) {
                        successCount.incrementAndGet();
                    } else {
                        failureCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        // Release all threads simultaneously
        startLatch.countDown();
        finishLatch.await();
        executorService.shutdown();

        // Step 3: Verify assertions per AGENTS.md rule 18
        Product updatedProduct = productRepository.findById(productId).orElseThrow();
        assertThat(successCount.get()).isEqualTo(10);
        assertThat(failureCount.get()).isEqualTo(0);
        assertThat(updatedProduct.getStock()).isEqualTo(0);
    }
}
