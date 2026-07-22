package com.training.starter.repository;

import com.training.starter.entity.Order;
import com.training.starter.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"user", "items"})
    Page<Order> findAllByStatus(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items"})
    @Override
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items"})
    @Override
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"user", "items"})
    Page<Order> findByUserId(Long userId, Pageable pageable);
}
