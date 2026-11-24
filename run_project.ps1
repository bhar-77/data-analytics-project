# TravelLens AI – PowerShell Startup Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "TravelLens AI – Intelligent Travel Search and Price Analytics System" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Verify ETL & Database
Write-Host "`n[1/3] Verifying MySQL database and seeding authentic datasets..." -ForegroundColor Yellow
& ".\.venv\Scripts\python.exe" backend\etl\pipeline.py

# 2. Start FastAPI Backend in background
Write-Host "`n[2/3] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath ".\.venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" -PassThru

# 3. Start Frontend in background
Write-Host "`n[3/3] Launching React Vite Frontend on http://127.0.0.1:3000..." -ForegroundColor Yellow
Set-Location "frontend"
$frontendJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev", "--", "--host", "127.0.0.1", "--port", "3000" -PassThru
Set-Location ".."

Write-Host "`nTravelLens AI is running live!" -ForegroundColor Green
Write-Host "  ➜ Frontend Website: http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "  ➜ FastAPI Swagger UI: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  ➜ MySQL Database: 127.0.0.1:3306 (travellens_db)" -ForegroundColor Cyan
