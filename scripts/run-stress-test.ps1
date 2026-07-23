# OrderFlow Apache Bench (ab) Stress & Performance Benchmark Script (PowerShell)
# Usage: .\scripts\run-stress-test.ps1 -BaseUrl "http://localhost:8080" -Requests 1000 -Concurrency 50

param (
    [string]$BaseUrl = "http://localhost:8080",
    [int]$Requests = 1000,
    [int]$Concurrency = 50,
    [string]$ReportPath = "benchmark-report.md"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting OrderFlow Performance Stress Test (Apache Bench)" -ForegroundColor Cyan
Write-Host " Target URL   : $BaseUrl" -ForegroundColor Yellow
Write-Host " Total Reqs   : $Requests" -ForegroundColor Yellow
Write-Host " Concurrency  : $Concurrency" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Ensure ab (ApacheBench) or fallback HTTP load generator is present
$abPath = Get-Command "ab" -ErrorAction SilentlyContinue

$results = @()

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Header = "",
        [string]$BodyFile = ""
    )

    $url = "$BaseUrl$Endpoint"
    Write-Host "`n--> Benchmarking: $Name [$url]" -ForegroundColor Green

    if ($abPath) {
        $cmd = "ab -n $Requests -c $Concurrency"
        if ($Header) { $cmd += " -H `"$Header`"" }
        if ($Method -eq "POST" -and $BodyFile) { $cmd += " -p `"$BodyFile`" -T `"application/json`"" }
        $cmd += " `"$url`""

        Write-Host "Executing: $cmd" -ForegroundColor Gray
        $output = Invoke-Expression $cmd | Out-String
        Write-Host $output

        # Parse metrics from ab output
        $rps = 0
        $meanLatency = 0
        $failedReqs = 0

        if ($output -match "Requests per second:\s+([\d\.]+)") { $rps = [double]$Matches[1] }
        if ($output -match "Time per request:\s+([\d\.]+)\s+\[ms\]\s+\(mean\)") { $meanLatency = [double]$Matches[1] }
        if ($output -match "Failed requests:\s+(\d+)") { $failedReqs = [int]$Matches[1] }

        $errorRate = if ($Requests -gt 0) { [math]::Round(($failedReqs / $Requests) * 100, 2) } else { 0 }
        $status = if ($meanLatency -le 200 -and $errorRate -lt 1.0) { "PASS" } else { "WARN" }

        return [PSCustomObject]@{
            Endpoint    = $Name
            URL         = $Endpoint
            RPS         = $rps
            MeanLatency = "${meanLatency}ms"
            FailedReqs  = $failedReqs
            ErrorRate   = "${errorRate}%"
            Status      = $status
        }
    } else {
        Write-Host "[INFO] 'ab' (ApacheBench) command not found in PATH. Performing PowerShell Invoke-RestMethod fallback test..." -ForegroundColor Yellow
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $success = 0
        $failed = 0

        1..100 | ForEach-Object {
            try {
                $res = Invoke-RestMethod -Uri $url -Method $Method -ErrorAction Stop
                $script:success++
            } catch {
                $script:failed++
            }
        }
        $stopwatch.Stop()
        $totalMs = $stopwatch.ElapsedMilliseconds
        $avgMs = [math]::Round($totalMs / 100, 2)
        $errPct = [math]::Round(($failed / 100) * 100, 2)
        $status = if ($avgMs -le 200 -and $errPct -lt 1.0) { "PASS" } else { "WARN" }

        return [PSCustomObject]@{
            Endpoint    = $Name
            URL         = $Endpoint
            RPS         = [math]::Round(100 / ($totalMs / 1000), 2)
            MeanLatency = "${avgMs}ms"
            FailedReqs  = $failed
            ErrorRate   = "${errPct}%"
            Status      = $status
        }
    }
}

# 1. Product Catalog List
$res1 = Test-Endpoint -Name "Product Catalog List" -Endpoint "/api/v1/products?page=0&size=10"
$results += $res1

# 2. Product Detail Cache
$res2 = Test-Endpoint -Name "Product Detail (Cached)" -Endpoint "/api/v1/products/1"
$results += $res2

# 3. Product Full-Text Search
$res3 = Test-Endpoint -Name "Product Full-Text Search" -Endpoint "/api/v1/products/search?q=Laptop"
$results += $res3

# 4. Categories List
$res4 = Test-Endpoint -Name "Category List" -Endpoint "/api/v1/categories"
$results += $res4

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " BENCHMARK SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
$results | Format-Table -AutoSize

# Export markdown report
$markdown = @"
# OrderFlow Performance Benchmark Report

- **Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Target Host**: $BaseUrl
- **Total Requests per Test**: $Requests
- **Concurrency Level**: $Concurrency
- **Target SLA**: Mean Latency < 200ms | Error Rate < 1%

| Endpoint | Path | RPS (req/sec) | Mean Latency | Failed Reqs | Error Rate | SLA Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"@

foreach ($r in $results) {
    $markdown += "`n| $($r.Endpoint) | $($r.URL) | $($r.RPS) | $($r.MeanLatency) | $($r.FailedReqs) | $($r.ErrorRate) | **$($r.Status)** |"
}

Set-Content -Path $ReportPath -Value $markdown -Encoding UTF8
Write-Host "`nReport saved to: $ReportPath" -ForegroundColor Green
