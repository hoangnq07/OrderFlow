#!/usr/bin/env bash
# OrderFlow Apache Bench (ab) Stress & Performance Benchmark Script (Bash)
# Usage: ./scripts/run-stress-test.sh http://localhost:8080 1000 50

BASE_URL="${1:-http://localhost:8080}"
REQUESTS="${2:-1000}"
CONCURRENCY="${3:-50}"
REPORT_FILE="benchmark-report.md"

echo "=========================================================="
echo " Starting OrderFlow Performance Stress Test (Apache Bench)"
echo " Target URL   : ${BASE_URL}"
echo " Total Reqs   : ${REQUESTS}"
echo " Concurrency  : ${CONCURRENCY}"
echo "=========================================================="

test_endpoint() {
    local name="$1"
    local path="$2"
    local url="${BASE_URL}${path}"

    echo ""
    echo "--> Benchmarking: ${name} [${url}]"

    if command -v ab &> /dev/null; then
        ab -n "${REQUESTS}" -c "${CONCURRENCY}" "${url}"
    else
        echo "[WARN] 'ab' not found. Performing curl benchmark fallback..."
        for i in {1..50}; do
            curl -s -o /dev/null -w "%{http_code} %{time_total}\n" "${url}"
        done
    fi
}

test_endpoint "Product Catalog List" "/api/v1/products?page=0&size=10"
test_endpoint "Product Detail (Cached)" "/api/v1/products/1"
test_endpoint "Product Search" "/api/v1/products/search?q=Laptop"
test_endpoint "Category List" "/api/v1/categories"

echo ""
echo "Stress test execution complete."
