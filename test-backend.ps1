# Test backend compilation and startup
cd "c:\PROJEK\pemilihan\backend"

Write-Host "=== Testing Backend Compilation ===" -ForegroundColor Green
mvn clean compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful" -ForegroundColor Green
    
    Write-Host "=== Testing Backend Startup ===" -ForegroundColor Green
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -NoNewWindow -PassThru
    Start-Sleep -Seconds 10
    
    # Test if application is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/pemilihan" -Method GET -TimeoutSec 5
        Write-Host "✅ Backend is running successfully" -ForegroundColor Green
        Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Backend startup failed or not responding" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Compilation failed" -ForegroundColor Red
}
