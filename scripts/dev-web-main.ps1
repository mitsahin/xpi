#Requires -Version 5.1
<#
.SYNOPSIS
  Switch to origin/main and start the web app (H2 bee homepage).

.DESCRIPTION
  For Windows PowerShell 5.1. Stops leftover Node processes (optional),
  syncs main from origin, optionally builds @x-pi/shared, then runs
  npm run dev:web. Use this when localhost still shows the cinematic
  landing from another branch.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\dev-web-main.ps1
#>
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host "==> x-pi web on main (H2 bee homepage)" -ForegroundColor Cyan
Write-Host "    Repo: $Root"

# Soft stop: free Vite ports if stale Node processes are holding them.
# Safe to ignore if nothing is running or permission is denied.
Write-Host "==> Stopping Node processes (soft; ignore errors if none)..." -ForegroundColor Cyan
try {
  Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Write-Host "    Done (or none running)."
} catch {
  Write-Host "    Skipped (could not stop Node): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "==> git fetch origin..." -ForegroundColor Cyan
git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch origin failed" }

Write-Host "==> git checkout main..." -ForegroundColor Cyan
git checkout main
if ($LASTEXITCODE -ne 0) { throw "git checkout main failed" }

Write-Host "==> git pull origin main..." -ForegroundColor Cyan
git pull origin main
if ($LASTEXITCODE -ne 0) { throw "git pull origin main failed" }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$commit = (git log -1 --oneline).Trim()
Write-Host ""
Write-Host "Current branch: $branch" -ForegroundColor Green
Write-Host "Last commit:    $commit" -ForegroundColor Green
Write-Host ""

if ($branch -ne "main") {
  throw "Expected branch 'main', got '$branch'. Aborting so Vite does not start on the wrong tree."
}

# Shared package must be built for workspace imports; cheap if already up to date.
Write-Host "==> Building @x-pi/shared (if needed)..." -ForegroundColor Cyan
npm run build -w @x-pi/shared
if ($LASTEXITCODE -ne 0) { throw "@x-pi/shared build failed" }

Write-Host "==> Starting web on main (npm run dev:web)..." -ForegroundColor Cyan
Write-Host "    Open http://localhost:5173/ (or :5174) — expect H2 bee + 'Dili oyun gibi öğren'" -ForegroundColor Green
npm run dev:web
