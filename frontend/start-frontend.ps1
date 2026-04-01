# Quick Start Script - Frontend
# Run this script to start the frontend development server

Write-Host "Starting Online Platform Monitoring Frontend..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the frontend directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Are you in the frontend directory?" -ForegroundColor Red
    Write-Host "Run this command first:" -ForegroundColor Yellow
    Write-Host 'cd "d:\college marketing new\frontend"' -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "Dependencies found" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Cyan
    npm install
    Write-Host "Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Vite development server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "   Students: student1-student10 / student123" -ForegroundColor White
Write-Host "   Teacher:  teacher / teacher123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# Start the dev server
npm run dev
    