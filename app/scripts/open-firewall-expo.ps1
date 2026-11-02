# A executer en PowerShell ADMINISTRATEUR (clic droit > Executer en tant qu'administrateur)
# 1) Passe le Wi-Fi en reseau PRIVE (sinon Windows bloque l'iPad)
# 2) Ouvre les ports Metro (8081, 19000, 19001)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '=== GOALYA - Pare-feu + reseau prive ===' -ForegroundColor Cyan
Write-Host ''

# Wi-Fi en Public = cause #1 du timeout Expo Go sur iPad
$profiles = Get-NetConnectionProfile -ErrorAction SilentlyContinue |
  Where-Object { $_.NetworkCategory -eq 'Public' -and $_.InterfaceAlias -notmatch 'VirtualBox|VMware|vEthernet' }

foreach ($p in $profiles) {
  Set-NetConnectionProfile -InterfaceAlias $p.InterfaceAlias -NetworkCategory Private
  Write-Host "Reseau PRIVE : $($p.InterfaceAlias)" -ForegroundColor Green
}

$rules = @(
  @{ Name = 'GOALYA Expo Metro 8081'; Port = 8081 },
  @{ Name = 'GOALYA Expo Metro 19000'; Port = 19000 },
  @{ Name = 'GOALYA Expo Metro 19001'; Port = 19001 }
)

foreach ($r in $rules) {
  $existing = Get-NetFirewallRule -DisplayName $r.Name -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Regle deja presente: $($r.Name)"
    continue
  }
  New-NetFirewallRule -DisplayName $r.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $r.Port -Profile Any
  Write-Host "Regle ajoutee: $($r.Name) (port $($r.Port), tous profils)" -ForegroundColor Green
}

Write-Host ''
Write-Host 'OK. Relance : npm run start:lan' -ForegroundColor Green
Write-Host 'iPad : exp://<IP affichee>:8081 (meme Wi-Fi)' -ForegroundColor Green
Write-Host ''
