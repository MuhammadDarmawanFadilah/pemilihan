# Test script untuk edit jenis laporan API
Write-Host "Testing Edit Jenis Laporan API..." -ForegroundColor Green

# Test data untuk update
$updateData = @{
    nama = "Laporan Penelitian Updated"
    deskripsi = "Deskripsi yang sudah diupdate"
    status = "AKTIF"
    tahapanList = @(
        @{
            tahapanLaporanId = 1
            nama = "Tahapan 1 Updated"
            deskripsi = "Deskripsi tahapan 1 yang sudah diupdate"
            templateTahapan = "template_updated.pdf"
            urutanTahapan = 1
            jenisFileIzin = @("pdf", "docx")
            status = "AKTIF"
        },
        @{
            # New tahapan (no ID)
            nama = "Tahapan Baru"
            deskripsi = "Tahapan baru yang ditambahkan"
            templateTahapan = ""
            urutanTahapan = 2
            jenisFileIzin = @("pdf", "jpg")
            status = "AKTIF"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Update data prepared:" -ForegroundColor Yellow
Write-Host $updateData

# Test update endpoint (replace 1 with actual ID)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/jenis-laporan/1" -Method PUT -Body $updateData -ContentType "application/json"
    Write-Host "✅ Update successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Update failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`nTest completed." -ForegroundColor Green
