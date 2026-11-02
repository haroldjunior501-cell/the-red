# Pre-flight checks before test / production launch
$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent
$appEnv = Join-Path $root ".env"
$serverEnv = Join-Path $root "server\.env"
$firebaseJson = Join-Path $root "server\firebase-service-account.json"
$fail = 0

function Test-Line {
  param(
    [string]$Path,
    [string]$Pattern,
    [string]$Label,
    [bool]$Required = $true
  )
  if (-not (Test-Path $Path)) {
    if ($Required) {
      Write-Host "[FAIL] $Label - fichier manquant: $Path" -ForegroundColor Red
      $script:fail++
    }
    return
  }
  $m = Select-String -Path $Path -Pattern $Pattern -ErrorAction SilentlyContinue
  $val = ""
  if ($m) { $val = ($m.Line -split "=", 2)[1].Trim() }
  if ([string]::IsNullOrWhiteSpace($val)) {
    if ($Required) {
      Write-Host "[FAIL] $Label" -ForegroundColor Red
      $script:fail++
    } else {
      Write-Host "[WARN] $Label" -ForegroundColor Yellow
    }
  } else {
    Write-Host "[ OK ] $Label" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "=== GOALYA launch check ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $appEnv)) {
  Write-Host "[FAIL] .env racine absent (copie .env.example)" -ForegroundColor Red
  $fail++
} else {
  Test-Line $appEnv '^EXPO_PUBLIC_FIREBASE_API_KEY=.+' 'Firebase API key'
  Test-Line $appEnv '^EXPO_PUBLIC_FIREBASE_DATABASE_URL=https?://.+' 'Firebase Realtime Database URL'
  Test-Line $appEnv '^EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=.+\.apps\.googleusercontent\.com' 'Google iOS client ID'
  Test-Line $appEnv '^EXPO_PUBLIC_LIVESCORE_KEY=.+' 'Live Score key'
  Test-Line $appEnv '^EXPO_PUBLIC_LIVESCORE_SECRET=.+' 'Live Score secret'
  Test-Line $appEnv '^EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk\.' 'Mapbox token'
  Test-Line $appEnv '^EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_' 'Stripe publishable key'
  Test-Line $appEnv '^EXPO_PUBLIC_API_URL=https?://.+' 'API URL (app)' $false
  Test-Line $appEnv '^EXPO_PUBLIC_LAUNCH_MODE=(1|true|yes)' 'Launch mode beta' $false
}

Test-Line $serverEnv '^STRIPE_SECRET_KEY=sk_' 'Stripe secret key (server)'

if (Test-Path $firebaseJson) {
  Write-Host "[ OK ] Firebase service account JSON" -ForegroundColor Green
} else {
  Write-Host "[FAIL] server/firebase-service-account.json" -ForegroundColor Red
  $fail++
}

try {
  $health = Invoke-RestMethod -Uri "http://localhost:4242/health" -TimeoutSec 3
  if ($health.ok) {
    $fb = if ($health.firebaseReady) { "firebaseReady" } else { "firebase JSON manquant" }
    $ls = if ($health.livescoreConfigured) { "livescore OK" } else { "livescore off" }
    Write-Host "[ OK ] Serveur API - $fb, $ls" -ForegroundColor Green
  }
} catch {
  Write-Host "[WARN] Serveur non demarre - npm run beta:server" -ForegroundColor Yellow
}

Write-Host ""
if ($fail -eq 0) {
  Write-Host "Pret pour build preview : npm run build:preview:ios / android" -ForegroundColor Green
  Write-Host "Suite beta : npm run beta:preflight" -ForegroundColor DarkGray
} else {
  Write-Host ('{0} bloqueur(s). Corriger avant la beta.' -f $fail) -ForegroundColor Red
}
Write-Host ""
exit $fail
