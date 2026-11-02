# Configure Stripe test keys in app/.env and server/.env
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$appEnv = Join-Path $root ".env"
$serverDir = Join-Path $root "server"
$serverEnv = Join-Path $serverDir ".env"
$firebaseJson = Join-Path $serverDir "firebase-service-account.json"

Write-Host ""
Write-Host "=== GOALYA - Stripe setup (test mode) ===" -ForegroundColor Cyan
Write-Host "Dashboard: https://dashboard.stripe.com/test/apikeys"
Write-Host ""

if (-not (Test-Path $appEnv)) {
  Write-Host "Missing file: $appEnv" -ForegroundColor Red
  exit 1
}

$pk = Read-Host "Paste publishable key (pk_test_...)"
if (-not $pk.StartsWith("pk_test_") -and -not $pk.StartsWith("pk_live_")) {
  Write-Host "Error: publishable key must start with pk_test_ or pk_live_" -ForegroundColor Red
  exit 1
}

$sk = Read-Host "Paste secret key (sk_test_...)" -AsSecureString
$skPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sk)
)
if (-not $skPlain.StartsWith("sk_test_") -and -not $skPlain.StartsWith("sk_live_")) {
  Write-Host "Error: secret key must start with sk_test_ or sk_live_" -ForegroundColor Red
  exit 1
}

function Set-EnvLine {
  param([string]$Path, [string]$Key, [string]$Value)
  $lines = @()
  if (Test-Path $Path) { $lines = Get-Content $Path -Encoding UTF8 }
  $found = $false
  $out = foreach ($line in $lines) {
    if ($line -match "^$([regex]::Escape($Key))=") {
      $found = $true
      "$Key=$Value"
    } else { $line }
  }
  if (-not $found) { $out += "$Key=$Value" }
  $out | Set-Content $Path -Encoding UTF8
}

Set-EnvLine $appEnv "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY" $pk.Trim()
Set-EnvLine $serverEnv "STRIPE_SECRET_KEY" $skPlain.Trim()
Write-Host "Keys saved to .env and server/.env" -ForegroundColor Green

if (-not (Test-Path $firebaseJson)) {
  Write-Host ""
  Write-Host "Firebase Admin (required to credit FP after payment):" -ForegroundColor Yellow
  Write-Host "  1. https://console.firebase.google.com - project goalya"
  Write-Host "  2. Settings - Service accounts - Generate new private key"
  Write-Host "  3. Save JSON as:"
  Write-Host "     $firebaseJson"
  Write-Host ""
} else {
  Write-Host "firebase-service-account.json: OK" -ForegroundColor Green
}

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notmatch "^169\.254"
} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run server:stripe"
Write-Host "  2. Check: http://localhost:4242/health"
if ($ip) {
  Write-Host "  3. On phone (same Wi-Fi), optional in app/.env:"
  Write-Host "     EXPO_PUBLIC_API_URL=http://${ip}:4242"
}
Write-Host "  4. Native build (not Expo Go): npx expo run:android or run:ios"
Write-Host "  5. Metro: npx expo start -c"
Write-Host ""
