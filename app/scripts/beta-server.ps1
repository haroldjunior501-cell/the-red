# Start the beta API server (Stripe + Simulator) and print the LAN URL.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$stripeScript = Join-Path $PSScriptRoot 'stripe-dev.ps1'

Write-Host ''
Write-Host '=== GOALYA beta - API server ===' -ForegroundColor Cyan
Write-Host 'Keep this terminal open during the whole beta session.' -ForegroundColor DarkGray
Write-Host ''

& $stripeScript
