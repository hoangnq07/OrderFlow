# OrderFlow Performance Benchmark Report

- **Date**: 2026-07-23 15:44:08
- **Target Host**: http://localhost:8080
- **Total Requests per Test**: 1000
- **Concurrency Level**: 50
- **Target SLA**: Mean Latency < 200ms | Error Rate < 1%

| Endpoint | Path | RPS (req/sec) | Mean Latency | Failed Reqs | Error Rate | SLA Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Product Catalog List | /api/v1/products?page=0&size=10 | 28.17 | 35.5ms | 0 | 0% | **PASS** |
| Product Detail (Cached) | /api/v1/products/1 | 163.67 | 6.11ms | 0 | 0% | **PASS** |
| Product Full-Text Search | /api/v1/products/search?q=Laptop | 206.19 | 4.85ms | 0 | 0% | **PASS** |
| Category List | /api/v1/categories | 211.42 | 4.73ms | 0 | 0% | **PASS** |
