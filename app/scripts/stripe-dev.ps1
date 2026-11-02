# Start GOALYA Stripe API server
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$serverDir = Join-Path $root "server"

if (-not (Test-Path (Join-Path $serverDir ".env"))) {
  Write-Host "Create server/.env (see docs/STRIPE_SETUP.md) and set STRIPE_SECRET_KEY." -ForegroundColor Yellow
  exit 1
}

$match = Select-String -Path (Join-Path $serverDir ".env") -Pattern "^STRIPE_SECRET_KEY=(.+)$"
if (-not $match -or [string]::IsNullOrWhiteSpace($match.Matches[0].Groups[1].Value)) {
  Write-Host "STRIPE_SECRET_KEY is empty in server/.env - add sk_test_ from Stripe Dashboard." -ForegroundColor Red
  exit 1
}

function Get-LanIPv4 {
  $addrs = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike '127.*' -and
      $_.IPAddress -notlike '169.254.*' -and
      $_.PrefixOrigin -ne 'WellKnown'
    } |
    Sort-Object -Property InterfaceMetric

  foreach ($a in $addrs) {
    $alias = $a.InterfaceAlias
    if ($alias -match 'VirtualBox|VMware|Hyper-V|vEthernet|Loopback|Teredo|Bluetooth') { continue }
    if ($a.IPAddress -match '^192\.168\.56\.') { continue }
    return $a.IPAddress
  }

  return ($addrs | Select-Object -First 1).IPAddress
}

$ip = Get-LanIPv4

if ($ip) {
  Write-Host ""
  Write-Host "If the phone cannot reach the API, add to app/.env:" -ForegroundColor Cyan
  Write-Host "EXPO_PUBLIC_API_URL=http://${ip}:4242"
  Write-Host ""
}

Set-Location $serverDir
if (-not (Test-Path "node_modules")) { npm install }
npm run dev
