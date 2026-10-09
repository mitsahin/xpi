#Requires -Version 5.1
<#
.SYNOPSIS
  Hard-sync to origin/main and start the web app (H2 bee homepage).

.DESCRIPTION
  For Windows PowerShell 5.1. Stops only this repo's Vite processes (ports
  5173-5179 or node command lines mentioning vite / apps/web), then
  fetch + checkout main + reset --hard origin/main (discards local dirty
  tree - intentional so package-lock / stray edits cannot block sync),
  builds @walky-talky/shared, then runs npm run dev:web.

  Purpose: show the H2 bee homepage from origin/main, not a dirty or
  cinematic branch tree.

  IMPORTANT: Keep this file ASCII-only (no em-dash, curly quotes, or
  non-ASCII letters). Windows PowerShell 5.1 often mis-parses UTF-8
  without BOM and reports "string missing terminator".

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\dev-web-main.ps1
#>

# Keep Stop for PowerShell cmdlets; native exe stderr must not abort (see Invoke-Native).
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host "==> Walky Talky web on main (H2 bee homepage)" -ForegroundColor Cyan
Write-Host "    Repo: $Root"

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command
  )
  # Windows PowerShell 5.1 treats native stderr as error records; with Stop that
  # aborts even when the process exit code is 0. Use Continue, then check exit.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & $Command
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($null -eq $code) { $code = 0 }
  if ($code -ne 0) {
    throw "$Label failed (exit $code)"
  }
}

function Stop-RepoVite {
  # Only Vite for this monorepo - never kill every node.exe on the machine.
  $stopped = @{}

  function Stop-PidSafe([int]$ProcessId, [string]$Reason) {
    if ($ProcessId -le 0 -or $stopped.ContainsKey($ProcessId)) { return }
    $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $proc) { return }
    if ($proc.ProcessName -notmatch '^(node|nodejs)$') { return }
    try {
      Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
      $stopped[$ProcessId] = $Reason
      Write-Host "    Stopped PID $ProcessId ($Reason)"
    } catch {
      # ignore
    }
  }

  # Ports commonly used by this app's Vite (`npm run dev:web`).
  foreach ($port in 5173..5179) {
    try {
      $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
      foreach ($c in @($conns)) {
        if ($c.OwningProcess) {
          Stop-PidSafe -ProcessId ([int]$c.OwningProcess) -Reason "listening on port $port"
        }
      }
    } catch {
      # Get-NetTCPConnection may be unavailable or need elevation; ignore.
    }
  }

  # Command-line match: vite or apps/web (do not kill unrelated node / API).
  try {
    $nodes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
    foreach ($n in @($nodes)) {
      $cmd = [string]$n.CommandLine
      if ([string]::IsNullOrWhiteSpace($cmd)) { continue }
      $cmdLower = $cmd.ToLowerInvariant()
      if (($cmdLower -match '\bvite\b') -or ($cmdLower -match 'apps[\\/]web')) {
        Stop-PidSafe -ProcessId ([int]$n.ProcessId) -Reason "command line matches vite/apps/web"
      }
    }
  } catch {
    # WMI/CIM unavailable - port-based stop may still have worked.
  }

  if ($stopped.Count -eq 0) {
    Write-Host "    No matching Vite processes found (ok)."
  }
}

Write-Host "==> Stopping this repo's Vite (ports 5173-5179 / vite|apps/web)..." -ForegroundColor Cyan
try {
  Stop-RepoVite
} catch {
  Write-Host "    Skipped (could not stop Vite): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "==> git fetch origin..." -ForegroundColor Cyan
Invoke-Native "git fetch origin" { git fetch origin }

Write-Host "==> git checkout main..." -ForegroundColor Cyan
Invoke-Native "git checkout main" { git checkout main }

Write-Host ""
Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Yellow
Write-Host "  WARNING: HARD RESET to origin/main" -ForegroundColor Yellow
Write-Host "  This DISCARDS all local uncommitted changes (including a" -ForegroundColor Yellow
Write-Host "  dirty package-lock.json). That is intentional - this" -ForegroundColor Yellow
Write-Host "  script's job is to show H2 from origin/main, not your" -ForegroundColor Yellow
Write-Host "  dirty working tree. Stash first if you need to keep work." -ForegroundColor Yellow
Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Yellow
Write-Host ""

Write-Host "==> git reset --hard origin/main..." -ForegroundColor Cyan
Invoke-Native "git reset --hard origin/main" { git reset --hard origin/main }

$prev = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$commit = (git log -1 --oneline).Trim()
$originMain = (git rev-parse origin/main).Trim()
$head = (git rev-parse HEAD).Trim()
$ErrorActionPreference = $prev

Write-Host ""
Write-Host "Current branch: $branch" -ForegroundColor Green
Write-Host "Last commit:    $commit" -ForegroundColor Green
Write-Host "HEAD == origin/main: $($head -eq $originMain)" -ForegroundColor Green
Write-Host ""

if ($branch -ne "main") {
  throw "Expected branch 'main', got '$branch'. Aborting so Vite does not start on the wrong tree."
}
if ($head -ne $originMain) {
  throw "HEAD does not match origin/main after reset. Aborting."
}

Write-Host "==> Building @walky-talky/shared (if needed)..." -ForegroundColor Cyan
Invoke-Native "@walky-talky/shared build" { npm run build -w @walky-talky/shared }

Write-Host "==> Starting web on main (npm run dev:web)..." -ForegroundColor Cyan
Write-Host "    Open http://localhost:5173/ (or :5174) - expect H2 bee homepage" -ForegroundColor Green

# Final npm is long-running; still use Continue so stderr progress does not abort.
$ErrorActionPreference = "Continue"
npm run dev:web
exit $LASTEXITCODE
