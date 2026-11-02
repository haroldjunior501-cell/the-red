# GOALYA beta - verification complete avant distribution
$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GOALYA - Pre-vol beta test" -ForegroundColor Cyan
Write-Host "  docs/BETA_TEST/README.md" -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& (Join-Path $PSScriptRoot "launch-check.ps1")
$checkExit = $LASTEXITCODE

$appEnv = Join-Path $root ".env"
$warn = 0

function Warn-Line {
  param([string]$Msg)
  Write-Host "[WARN] $Msg" -ForegroundColor Yellow
  $script:warn++
}

if (Test-Path $appEnv) {
  $api = Select-String -Path $appEnv -Pattern "^EXPO_PUBLIC_API_URL=(.+)$" -ErrorAction SilentlyContinue
  $apiVal = if ($api) { $api.Matches[0].Groups[1].Value.Trim() } else { "" }
  if ($apiVal -match "localhost|127\.0\.0\.1") {
    Warn-Line "EXPO_PUBLIC_API_URL = localhost : les telephones ne joindront pas l'API. Utilise l'IP LAN (npm run beta:server)."
  }
  if (-not (Select-String -Path $appEnv -Pattern "^EXPO_PUBLIC_FIREBASE_DATABASE_URL=.+" -Quiet)) {
    Warn-Line "EXPO_PUBLIC_FIREBASE_DATABASE_URL manquant - Hub / chat RTDB."
  }
  if (-not (Select-String -Path $appEnv -Pattern "^EXPO_PUBLIC_LAUNCH_MODE=(1|true|yes)" -Quiet)) {
    Warn-Line "EXPO_PUBLIC_LAUNCH_MODE absent - Arena / Tableau KO peuvent rester verrouilles en beta."
  }
} else {
  Warn-Line "Fichier .env absent - copie .env.example vers .env"
}

Write-Host ""
Write-Host "--- IP locale (EXPO_PUBLIC_API_URL) ---" -ForegroundColor Cyan
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notmatch "^169\.254"
} | Select-Object -First 1).IPAddress
if ($ip) {
  Write-Host "  http://${ip}:4242" -ForegroundColor Green
} else {
  Warn-Line "IP LAN introuvable"
}

Write-Host ""
Write-Host "--- Etapes manuelles restantes ---" -ForegroundColor Cyan
Write-Host "  1. npm run firebase:deploy:rules"
Write-Host "  2. npm run build:preview:ios  /  build:preview:android"
Write-Host "  3. Jour J : npm run beta:server"
Write-Host "  4. Smoke test : docs/BETA_TEST/TESTEURS.md"
Write-Host ""

if ($checkExit -ne 0) {
  Write-Host ('BETA : NON PRETE - {0} bloqueur(s)' -f $checkExit) -ForegroundColor Red
  exit $checkExit
}
if ($warn -gt 0) {
  Write-Host ('BETA : PRETE avec {0} avertissement(s)' -f $warn) -ForegroundColor Yellow
  exit 0
}
Write-Host "BETA : PRETE pour build + distribution" -ForegroundColor Green
exit 0
