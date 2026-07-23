# OrderFlow Performance Benchmark Report

- **Date**: 2026-07-23 13:41:45
- **Target Host**: http://localhost:8080
- **Total Requests per Test**: 1000
- **Concurrency Level**: 50
- **Target SLA**: Mean Latency < 200ms | Error Rate < 1%

| Endpoint | Path | RPS (req/sec) | Mean Latency | Failed Reqs | Error Rate | SLA Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Product Catalog List | /api/v1/products?page=0&size=10 | 178.57 | 5.6ms | 0 | 0% | **PASS** |
| Product Detail (Cached) | /api/v1/products/1 | 208.77 | 4.79ms | 0 | 0% | **PASS** |
| Product Full-Text Search | /api/v1/products/search?q=Laptop | 231.48 | 4.32ms | 0 | 0% | **PASS** |
| Category List | /api/v1/categories | 221.24 | 4.52ms | 0 | 0% | **PASS** |
