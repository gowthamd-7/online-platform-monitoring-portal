# Quick Start Script - Backend
# Run this script to start the backend server

Write-Host "Starting Online Platform Monitoring Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (!(Test-Path "main.py")) {
    Write-Host "Error: main.py not found. Are you in the backend directory?" -ForegroundColor Red
    Write-Host "Run this command first:" -ForegroundColor Yellow
    Write-Host 'cd "d:\college marketing new\backend"' -ForegroundColor Yellow
    exit 1
}

# Check if venv exists
if (Test-Path "venv") {
    Write-Host "Virtual environment found" -ForegroundColor Green
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found" -ForegroundColor Yellow
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    .\venv\Scripts\Activate.ps1
}

# Check if packages are installed
Write-Host ""
Write-Host "Installing/Updating dependencies..." -ForegroundColor Cyan

# Auto-heal common broken numpy artifacts that cause pip and FastAPI startup issues
$sitePackages = Join-Path $PSScriptRoot "venv\Lib\site-packages"
if (Test-Path $sitePackages) {
    $brokenItems = @(
        "~umpy",
        "~umpy.libs",
        "~umpy-*.dist-info"
    )

    $removedAny = $false
    foreach ($pattern in $brokenItems) {
        $matches = Get-ChildItem -Path $sitePackages -Filter $pattern -Force -ErrorAction SilentlyContinue
        foreach ($item in $matches) {
            try {
                Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction Stop
                if (-not $removedAny) {
                    Write-Host "Detected corrupted package artifacts. Cleaning up..." -ForegroundColor Yellow
                    $removedAny = $true
                }
                Write-Host "  Removed $($item.Name)" -ForegroundColor DarkYellow
            } catch {
                Write-Host "  Failed to remove $($item.Name): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }

    $badWheel = Join-Path $sitePackages "numpy-1.26.4-cp310-cp310-win_amd64.whl"
    if (Test-Path $badWheel) {
        try {
            Remove-Item -Path $badWheel -Force -ErrorAction Stop
            if (-not $removedAny) {
                Write-Host "Detected corrupted package artifacts. Cleaning up..." -ForegroundColor Yellow
                $removedAny = $true
            }
            Write-Host "  Removed numpy-1.26.4-cp310-cp310-win_amd64.whl" -ForegroundColor DarkYellow
        } catch {
            Write-Host "  Failed to remove numpy wheel artifact: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    if ($removedAny) {
        Write-Host "Package cleanup completed." -ForegroundColor Green
    }
}

pip install -r requirements.txt

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# Start the server
uvicorn main:app --reload --port 8000
