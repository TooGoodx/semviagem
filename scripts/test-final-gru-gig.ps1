$ErrorActionPreference = 'Stop'
$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "Testando GRU -> GIG com formato correto...`n" -ForegroundColor Cyan

# Token
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host "Token: OK`n"

$Headers = @{Accept='application/json';'Content-Type'='application/json';Authorization="Bearer $token"}
$Body = @{Origem='GRU';Destino='GIG';Ida='2025-10-09';Adultos=1;Criancas=0;Bebes=0;Companhia=-1;Classe=1;TipoViagem=1}|ConvertTo-Json -Compress

Write-Host "Enviando requisicao..." -NoNewline
$Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 120
Write-Host " OK`n" -ForegroundColor Green

$count=0
if($Resp.Data){foreach($g in $Resp.Data){if($g.flights){$count+=($g.flights|Measure-Object).Count}}}

Write-Host "RESULTADO: $count voos encontrados" -ForegroundColor Green
if ($Resp.Data -and $Resp.Data[0].MinPrice) {
    Write-Host "Preco Minimo: R$ $($Resp.Data[0].MinPrice)"
    Write-Host "Preco Maximo: R$ $($Resp.Data[0].MaxPrice)"
}
