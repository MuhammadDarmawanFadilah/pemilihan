# Test Laporan API Endpoints
# 
# This script tests all the laporan API endpoints to ensure they work properly

$baseUrl = "http://localhost:8080/api"
$headers = @{
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
}

Write-Host "Testing Laporan API Endpoints..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test 1: Get all laporan with pagination
Write-Host "`n1. Testing GET /laporan (Get all laporan)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/laporan?page=0&size=10" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($response.totalElements) laporan" -ForegroundColor Green
    Write-Host "  - Total pages: $($response.totalPages)" -ForegroundColor Cyan
    Write-Host "  - Current page: $($response.number)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get jenis laporan (needed for creating laporan)
Write-Host "`n2. Testing GET /jenis-laporan (Get jenis laporan)" -ForegroundColor Yellow
try {
    $jenisLaporan = Invoke-RestMethod -Uri "$baseUrl/jenis-laporan" -Method GET -Headers $headers
    Write-Host "✓ Success: Found $($jenisLaporan.length) jenis laporan" -ForegroundColor Green
    if ($jenisLaporan.length -gt 0) {
        $firstJenisId = $jenisLaporan[0].jenisLaporanId
        Write-Host "  - Using jenis laporan ID: $firstJenisId for testing" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $firstJenisId = 1  # fallback
}

# Test 3: Create a new laporan
Write-Host "`n3. Testing POST /laporan (Create laporan)" -ForegroundColor Yellow
$newLaporan = @{
    namaLaporan = "Test Laporan API - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    deskripsi = "This is a test laporan created via API"
    namaPelapor = "Test User API"
    alamatPelapor = "Test Address API"
    jenisLaporanId = $firstJenisId
    userId = 1  # assume user ID 1 exists
    status = "DRAFT"
} | ConvertTo-Json

try {
    $createdLaporan = Invoke-RestMethod -Uri "$baseUrl/laporan" -Method POST -Headers $headers -Body $newLaporan
    Write-Host "✓ Success: Created laporan with ID: $($createdLaporan.laporanId)" -ForegroundColor Green
    $testLaporanId = $createdLaporan.laporanId
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get laporan by ID
if ($testLaporanId) {
    Write-Host "`n4. Testing GET /laporan/{id} (Get laporan by ID)" -ForegroundColor Yellow
    try {
        $laporan = Invoke-RestMethod -Uri "$baseUrl/laporan/$testLaporanId" -Method GET -Headers $headers
        Write-Host "✓ Success: Retrieved laporan '$($laporan.namaLaporan)'" -ForegroundColor Green
        Write-Host "  - Status: $($laporan.status)" -ForegroundColor Cyan
        Write-Host "  - Progress: $($laporan.progressPercentage)%" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Search laporan
Write-Host "`n5. Testing POST /laporan/search (Search with filters)" -ForegroundColor Yellow
$searchBody = @{
    page = 0
    size = 10
    sortBy = "createdAt"
    sortDirection = "desc"
} | ConvertTo-Json

try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/laporan/search" -Method POST -Headers $headers -Body $searchBody
    Write-Host "✓ Success: Search returned $($searchResults.totalElements) results" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get laporan statistics
Write-Host "`n6. Testing GET /laporan/stats (Get statistics)" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/laporan/stats" -Method GET -Headers $headers
    Write-Host "✓ Success: Retrieved laporan statistics" -ForegroundColor Green
    Write-Host "  - Total: $($stats.total)" -ForegroundColor Cyan
    Write-Host "  - Draft: $($stats.draft)" -ForegroundColor Cyan
    Write-Host "  - Dalam Proses: $($stats.dalamProses)" -ForegroundColor Cyan
    Write-Host "  - Selesai: $($stats.selesai)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Laporan API Testing Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
