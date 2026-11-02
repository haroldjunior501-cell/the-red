# Diagnostic connexion Expo Go (PC Windows <-> iPad meme Wi-Fi)
# Usage : powershell -ExecutionPolicy Bypass -File scripts/diagnose-expo.ps1

$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

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
$ok = $true

Write-Host ''
Write-Host '========== GOALYA - Diagnostic Expo Go ==========' -ForegroundColor Cyan
Write-Host ''

Write-Host '[1] Profil Wi-Fi / Ethernet' -ForegroundColor Yellow
$profiles = Get-NetConnectionProfile -ErrorAction SilentlyContinue |
  Where-Object { $_.NetworkCategory -ne 'DomainAuthenticated' }
if (-not $profiles) {
  Write-Host '  (impossible de lire les profils reseau)' -ForegroundColor DarkGray
} else {
  foreach ($p in $profiles) {
    $color = if ($p.NetworkCategory -eq 'Private') { 'Green' } else { 'Red' }
    Write-Host "  $($p.InterfaceAlias) : $($p.NetworkCategory)" -ForegroundColor $color
    if ($p.NetworkCategory -eq 'Public') {
      $ok = $false
      Write-Host '  -> Passe en PRIVE : Parametres > Reseau > Wi-Fi > Proprietes > Reseau prive' -ForegroundColor Red
      Write-Host "     ou (admin) : Set-NetConnectionProfile -InterfaceAlias '$($p.InterfaceAlias)' -NetworkCategory Private"
    }
  }
}

Write-Host ''
Write-Host '[2] IP pour Expo Go' -ForegroundColor Yellow
if ($ip) {
  Write-Host "  IP PC        : $ip" -ForegroundColor Green
  Write-Host "  URL iPad     : exp://$($ip):8081" -ForegroundColor Green
} else {
  $ok = $false
  Write-Host '  ERREUR : aucune IP LAN (Wi-Fi deconnecte ?)' -ForegroundColor Red
}

Write-Host ''
Write-Host '[3] Metro (port 8081)' -ForegroundColor Yellow
$listen = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
if ($listen) {
  Write-Host '  Metro ECOUTE sur le port 8081' -ForegroundColor Green
  $addrs = $listen | Select-Object -ExpandProperty LocalAddress -Unique
  Write-Host "  Adresses     : $($addrs -join ', ')"
  if ($addrs -notcontains '0.0.0.0' -and $addrs -notcontains '::' -and $addrs -notcontains $ip) {
    Write-Host '  ATTENTION : Metro peut n ecouter que localhost - relance npm run start:lan' -ForegroundColor Yellow
  }
} else {
  $ok = $false
  Write-Host '  Metro NE TOURNE PAS - lance : npm run start:lan' -ForegroundColor Red
  Write-Host '  Garde le terminal OUVERT pendant le test sur iPad.' -ForegroundColor Red
}

Write-Host ''
Write-Host '[4] Test HTTP localhost:8081/status' -ForegroundColor Yellow
try {
  $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8081/status' -UseBasicParsing -TimeoutSec 5
  $body = if ($r.Content -is [string]) { $r.Content.Trim() } else { [string]$r.Content }
  Write-Host "  OK ($($r.StatusCode)) : $body" -ForegroundColor Green
} catch {
  $ok = $false
  Write-Host "  ECHEC : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ''
Write-Host '[5] Regles pare-feu GOALYA' -ForegroundColor Yellow
$ruleNames = @('GOALYA Expo Metro 8081', 'GOALYA Expo Metro 19000', 'GOALYA Expo Metro 19001')
$missing = @()
foreach ($name in $ruleNames) {
  $rule = Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue
  if ($rule) {
    Write-Host "  OK : $name" -ForegroundColor Green
  } else {
    $missing += $name
    Write-Host "  MANQUANT : $name" -ForegroundColor Red
  }
}
if ($missing.Count -gt 0) {
  $ok = $false
  Write-Host ''
  Write-Host '  -> Clic droit PowerShell ADMIN puis :' -ForegroundColor Yellow
  Write-Host '     powershell -ExecutionPolicy Bypass -File scripts/open-firewall-expo.ps1'
}

Write-Host ''
Write-Host '[6] Fichiers Expo requis' -ForegroundColor Yellow
$required = @('assets/icon.png', 'assets/splash-icon.png')
foreach ($f in $required) {
  if (Test-Path $f) { Write-Host "  OK : $f" -ForegroundColor Green }
  else {
    $ok = $false
    Write-Host "  MANQUANT : $f - lance npm run assets:placeholders" -ForegroundColor Red
  }
}

Write-Host ''
Write-Host '========== Resume ==========' -ForegroundColor Cyan
if ($ok) {
  Write-Host ' Pret pour Expo Go si Metro tourne (npm run start:lan).' -ForegroundColor Green
  if ($ip) { Write-Host " iPad : meme Wi-Fi, URL exp://$($ip):8081" -ForegroundColor Green }
} else {
  Write-Host ' Corrige les points ROUGES ci-dessus, puis relance npm run start:lan' -ForegroundColor Red
}
Write-Host ''
