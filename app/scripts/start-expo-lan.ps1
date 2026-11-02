# Démarre Expo en mode LAN avec la bonne IP (évite VirtualBox 192.168.56.x).
# Usage : powershell -ExecutionPolicy Bypass -File scripts/start-expo-lan.ps1

$ErrorActionPreference = 'Stop'
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
if (-not $ip) {
  Write-Host 'ERREUR: aucune IP LAN detectee.' -ForegroundColor Red
  exit 1
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
$env:EXPO_PACKAGER_PROXY_URL = ''

Write-Host ''
Write-Host '========================================' -ForegroundColor Green
Write-Host ' GOALYA — Expo LAN' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host " IP PC (Wi-Fi)     : $ip"
Write-Host " URL Expo Go       : exp://${ip}:8081"
Write-Host ' Test navigateur PC: http://localhost:8081'
Write-Host ''
Write-Host ' iPad : meme Wi-Fi, Expo Go > saisir URL ci-dessus'
Write-Host ' NE FERME PAS cette fenetre (Ctrl+C = arret Metro)'
Write-Host ''
Write-Host ' Si timeout iPad : scripts/diagnose-expo.ps1'
Write-Host ' Pare-feu (admin) : scripts/open-firewall-expo.ps1'
Write-Host ' Wi-Fi Windows doit etre en reseau PRIVE (pas Public)'
Write-Host '========================================' -ForegroundColor Green
Write-Host ''

# Libère le port 8081 si un ancien Metro tourne encore
$on8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($on8081) {
  Write-Host 'Port 8081 occupe — arret des processus node sur ce port...' -ForegroundColor Yellow
  $on8081 | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 2
}

npx expo start --lan -c
