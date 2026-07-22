package com.training.starter.dto.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalOrders,
        BigDecimal totalRevenue,
        long pendingOrders,
        long completedOrders,
        long totalProducts,
        long totalCustomers
) {
}
