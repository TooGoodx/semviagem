$ErrorActionPreference = 'Stop'

# Base URL of your Netlify Functions proxy
$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'
Write-Host "Using Base URL: $Base" -ForegroundColor Cyan

# 1) Get token
try {
  $tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
  $token = $tokenResp.access_token
  if (-not $token) { throw "Failed to retrieve access_token. Raw: $($tokenResp | ConvertTo-Json -Depth 6)" }
  Write-Host "✅ Token acquired" -ForegroundColor Green
} catch {
  Write-Error "Token request failed: $($_.Exception.Message)"
  exit 1
}

# 2) Common headers
$Headers = @{ Accept = 'application/json'; 'Content-Type' = 'application/json'; Authorization = "Bearer $token" }

# 3) Test matrix
$Airlines = @(1,2,3) # LATAM=1, GOL=2, AZUL=3 (adjust as needed)
$Origem = 'BSB'
$Destino = 'GRU'
$Ida    = '2025-10-15'
$Volta  = '2025-10-20'

function Invoke-FlightSearch {
  param(
    [string]$Origem,
    [string]$Destino,
    [string]$Ida,
    [int]$Companhia
  )
  $BodyObj = @{ Origem=$Origem; Destino=$Destino; Ida=$Ida; Adultos=1; Criancas=0; Bebes=0; Classe=0; Companhia=$Companhia }
  $BodyJson = $BodyObj | ConvertTo-Json -Compress
  try {
    $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $BodyJson -TimeoutSec 60
    $IdaCount = 0; $VoltaCount = 0
    if ($Resp.Data -and $Resp.Data.Count -gt 0) {
      $IdaCount = @($Resp.Data[0].Ida).Count
      $VoltaCount = @($Resp.Data[0].Volta).Count
    }
    [pscustomobject]@{ Success=$true; Ida=$IdaCount; Volta=$VoltaCount; Raw=$Resp }
  } catch {
    [pscustomobject]@{ Success=$false; Error=$_.Exception.Message }
  }
}

foreach ($Cia in $Airlines) {
  Write-Host "`n==== Companhia $Cia - Outbound ($Origem -> $Destino / $Ida) ==== " -ForegroundColor Yellow
  $Out = Invoke-FlightSearch -Origem $Origem -Destino $Destino -Ida $Ida -Companhia $Cia
  if ($Out.Success) {
    Write-Host ("Outbound: Ida={0} Volta={1}" -f $Out.Ida, $Out.Volta)
  } else {
    Write-Host ("Outbound FAILED: {0}" -f $Out.Error) -ForegroundColor Red
  }

  Write-Host "==== Companhia $Cia - Return ($Destino -> $Origem / $Volta) ==== " -ForegroundColor Yellow
  $Ret = Invoke-FlightSearch -Origem $Destino -Destino $Origem -Ida $Volta -Companhia $Cia
  if ($Ret.Success) {
    Write-Host ("Return: Ida={0} Volta={1}" -f $Ret.Ida, $Ret.Volta)
  } else {
    Write-Host ("Return FAILED: {0}" -f $Ret.Error) -ForegroundColor Red
  }
}

Write-Host "`nDone." -ForegroundColor Cyan
