<#
Helper script: load environment variables from .env into the current PowerShell session
and then start the backend using the existing start-backend.ps1 script.

Usage: run this from the repository root or backend folder. It will cd into backend.
#>

Set-Location "D:\college marketing new\backend"

if (Test-Path ".env") {
    Write-Host "Loading .env into process environment..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }

        $pair = $line -split('=',2)
        if ($pair.Length -eq 2) {
            $name = $pair[0].Trim()
            $value = $pair[1].Trim().Trim("'`"")
            Set-Item -Path "Env:$name" -Value $value
            Write-Host "  Set $name" -ForegroundColor DarkGray
        }
    }
} else {
    Write-Host ".env not found in backend directory; skipping." -ForegroundColor Yellow
}

Write-Host "Starting backend (start-backend.ps1)" -ForegroundColor Cyan
.\start-backend.ps1
