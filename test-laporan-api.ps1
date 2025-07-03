# Test script untuk API Laporan
$baseUrl = "http://localhost:8080/api"

# Test authentication first - get available endpoints
Write-Host "🔍 Testing backend connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/status" -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Backend is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test laporan endpoints without auth (to see if they require authentication)
Write-Host "`n🔍 Testing laporan search endpoint..." -ForegroundColor Cyan
try {
    $searchPayload = @{
        nama = ""
        status = ""
        page = 0
        size = 10
        sort = "createdAt"
        direction = "DESC"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/laporan/search" -Method POST -Body $searchPayload -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "✅ Laporan search endpoint is accessible" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Laporan search failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n✅ API test completed!" -ForegroundColor Green
