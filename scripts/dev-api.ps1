#Requires -Version 5.1
<#
.SYNOPSIS
  One-shot Windows setup: Docker Postgres + Prisma migrate/seed + API on :4000.

.DESCRIPTION
  Run from the repo root (or anywhere; script resolves the monorepo root).
  Requires: Docker Desktop running, Node.js 20+, npm install already done.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\dev-api.ps1
#>
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$ContainerName = "xpi-postgres"
$PgImage = "postgres:16"
$DatabaseUrl = "postgresql://xpi:xpi@localhost:5432/xpi?schema=public"
$ApiDir = Join-Path $Root "apps\api"
$EnvFile = Join-Path $ApiDir ".env"
$EnvExample = Join-Path $ApiDir ".env.example"

Write-Host "==> x-pi API local bootstrap (Windows)" -ForegroundColor Cyan
Write-Host "    Repo: $Root"

function Assert-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

Assert-Command docker
Assert-Command npm
Assert-Command npx
Assert-Command node

# --- Postgres via Docker ---
Write-Host "==> Ensuring Postgres Docker container '$ContainerName'..." -ForegroundColor Cyan
$existing = docker ps -a --filter "name=^/${ContainerName}$" --format "{{.Names}}" 2>$null
if (-not $existing) {
  # Also match without leading slash (Docker Desktop on Windows)
  $existing = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null |
    Where-Object { $_ -eq $ContainerName } |
    Select-Object -First 1
}

if (-not $existing) {
  Write-Host "    Creating container from $PgImage (port 5432)..."
  docker run -d `
    --name $ContainerName `
    -e POSTGRES_USER=xpi `
    -e POSTGRES_PASSWORD=xpi `
    -e POSTGRES_DB=xpi `
    -p 5432:5432 `
    $PgImage | Out-Null
} else {
  $running = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null |
    Where-Object { $_ -eq $ContainerName }
  if (-not $running) {
    Write-Host "    Starting existing container..."
    docker start $ContainerName | Out-Null
  } else {
    Write-Host "    Container already running."
  }
}

Write-Host "==> Waiting for Postgres to accept connections..." -ForegroundColor Cyan
$ready = $false
for ($i = 1; $i -le 40; $i++) {
  # Do not pipe docker output — piping resets $LASTEXITCODE in Windows PowerShell 5.1
  & docker exec $ContainerName pg_isready -U xpi -d xpi 1>$null 2>$null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 1
}
if (-not $ready) {
  throw "Postgres did not become ready in time. Is Docker Desktop running?"
}
Write-Host "    Postgres is ready."

# --- .env ---
if (-not (Test-Path $EnvFile)) {
  if (-not (Test-Path $EnvExample)) {
    throw "Missing $EnvExample"
  }
  Write-Host "==> Creating apps\api\.env from .env.example" -ForegroundColor Cyan
  Copy-Item $EnvExample $EnvFile
} else {
  Write-Host "==> apps\api\.env already exists (leaving as-is)" -ForegroundColor Cyan
}

# Ensure DATABASE_URL + CORS include Vite ports (5173/5174)
$envText = Get-Content $EnvFile -Raw
if ($envText -notmatch '(?m)^DATABASE_URL=') {
  Add-Content $EnvFile "`nDATABASE_URL=`"$DatabaseUrl`""
  $envText = Get-Content $EnvFile -Raw
}
if ($envText -notmatch '5174') {
  if ($envText -match 'CORS_ORIGIN="([^"]*)"') {
    $cors = $Matches[1]
    if ($cors -notmatch '5174') {
      $cors = ($cors.TrimEnd(',') + ",http://localhost:5174")
      $envText = $envText -replace 'CORS_ORIGIN="[^"]*"', "CORS_ORIGIN=`"$cors`""
      Set-Content -Path $EnvFile -Value $envText -NoNewline
      Write-Host "    Added http://localhost:5174 to CORS_ORIGIN"
    }
  } elseif ($envText -match '(?m)^CORS_ORIGIN=([^\r\n]+)') {
    $cors = $Matches[1].Trim('"')
    if ($cors -notmatch '5174') {
      $cors = ($cors.TrimEnd(',') + ",http://localhost:5174")
      $envText = $envText -replace '(?m)^CORS_ORIGIN=[^\r\n]+', "CORS_ORIGIN=`"$cors`""
      Set-Content -Path $EnvFile -Value $envText -NoNewline
      Write-Host "    Added http://localhost:5174 to CORS_ORIGIN"
    }
  }
}

# --- shared build (API imports @x-pi/shared) ---
Write-Host "==> Building @x-pi/shared..." -ForegroundColor Cyan
npm run build -w @x-pi/shared
if ($LASTEXITCODE -ne 0) { throw "shared build failed" }

# --- migrate + generate ---
Write-Host "==> Prisma migrate deploy + generate..." -ForegroundColor Cyan
Push-Location $ApiDir
try {
  $env:DATABASE_URL = $DatabaseUrl
  npx prisma migrate deploy
  if ($LASTEXITCODE -ne 0) {
    Write-Host "    migrate deploy failed; trying prisma migrate dev --name init..." -ForegroundColor Yellow
    npx prisma migrate dev --name init --skip-seed
    if ($LASTEXITCODE -ne 0) { throw "prisma migrate failed" }
  }
  npx prisma generate
  if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

  Write-Host "==> Seeding demo data (ALLOW_SEED_RESET=true)..." -ForegroundColor Cyan
  $env:ALLOW_SEED_RESET = "true"
  $env:NODE_ENV = "development"
  npx tsx prisma/seed.ts
  if ($LASTEXITCODE -ne 0) { throw "seed failed" }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Demo user: demo@x-pi.app / demo1234" -ForegroundColor Green
Write-Host "API will listen on http://localhost:4000" -ForegroundColor Green
Write-Host "Keep this window open. In another terminal: npm run dev:web" -ForegroundColor Green
Write-Host "Web proxy /api -> :4000 (Vite may use :5173 or :5174)." -ForegroundColor Green
Write-Host ""
Write-Host "==> Starting API (npm run dev:api)..." -ForegroundColor Cyan
npm run dev:api
