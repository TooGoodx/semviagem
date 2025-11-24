$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Busca COMPLETA IDA E VOLTA ===" -ForegroundColor Cyan
Write-Host "Rota: GRU <-> GIG" -ForegroundColor Yellow
Write-Host "Ida: 2025-10-09 | Volta: 2025-10-16`n" -ForegroundColor Yellow

# 1) Token
Write-Host "[1/3] Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# 2) Buscar voos de IDA
Write-Host "[2/3] Buscando voos de IDA (GRU -> GIG 09/10)..." -NoNewline

$BodyIda = @{
    Origem = 'GRU'
    Destino = 'GIG'
    Ida = '2025-10-09'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 1
    TipoViagem = 1
} | ConvertTo-Json -Compress

$RespIda = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $BodyIda -TimeoutSec 120
Write-Host " OK" -ForegroundColor Green

# 3) Buscar voos de VOLTA
Write-Host "[3/3] Buscando voos de VOLTA (GIG -> GRU 16/10)..." -NoNewline

$BodyVolta = @{
    Origem = 'GIG'
    Destino = 'GRU'
    Ida = '2025-10-16'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 1
    TipoViagem = 1
} | ConvertTo-Json -Compress

$RespVolta = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $BodyVolta -TimeoutSec 120
Write-Host " OK`n" -ForegroundColor Green

# Salvar arquivos
$outputIda = "C:\Users\Lenovo\CascadeProjects\buscadorReact\ida-gru-gig-completo.json"
$outputVolta = "C:\Users\Lenovo\CascadeProjects\buscadorReact\volta-gig-gru-completo.json"
$outputConsolidado = "C:\Users\Lenovo\CascadeProjects\buscadorReact\todos-voos-ida-volta.json"

$RespIda | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputIda -Encoding utf8
$RespVolta | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputVolta -Encoding utf8

# Contar voos
$totalIda = 0
$totalVolta = 0

if ($RespIda.Data) {
    foreach ($g in $RespIda.Data) {
        if ($g.flights) { $totalIda += ($g.flights | Measure-Object).Count }
    }
}

if ($RespVolta.Data) {
    foreach ($g in $RespVolta.Data) {
        if ($g.flights) { $totalVolta += ($g.flights | Measure-Object).Count }
    }
}

# Criar arquivo consolidado
$consolidado = [pscustomobject]@{
    Parametros = [pscustomobject]@{
        Origem = 'GRU'
        Destino = 'GIG'
        DataIda = '2025-10-09'
        DataVolta = '2025-10-16'
        Companhia = -1
        Classe = 'Economica'
    }
    RespostaIda = $RespIda
    RespostaVolta = $RespVolta
    Resumo = [pscustomobject]@{
        TotalVoosIda = $totalIda
        TotalVoosVolta = $totalVolta
        CompletedIda = $RespIda.Completed
        CompletedVolta = $RespVolta.Completed
        SuccessIda = $RespIda.Success
        SuccessVolta = $RespVolta.Success
        PrecoMinimoIda = if($RespIda.Data -and $RespIda.Data[0].MinPrice){$RespIda.Data[0].MinPrice}else{0}
        PrecoMaximoIda = if($RespIda.Data -and $RespIda.Data[0].MaxPrice){$RespIda.Data[0].MaxPrice}else{0}
        PrecoMinimoVolta = if($RespVolta.Data -and $RespVolta.Data[0].MinPrice){$RespVolta.Data[0].MinPrice}else{0}
        PrecoMaximoVolta = if($RespVolta.Data -and $RespVolta.Data[0].MaxPrice){$RespVolta.Data[0].MaxPrice}else{0}
    }
}

$consolidado | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputConsolidado -Encoding utf8

# Resumo
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "`nVOOS DE IDA (GRU -> GIG em 09/10/2025):"
Write-Host "  Status: $(if($RespIda.Success){'✓ Success'}else{'✗ Erro'})"
Write-Host "  Completed: $($RespIda.Completed)"
Write-Host "  Total voos: $totalIda"
if ($totalIda -gt 0) {
    Write-Host "  Preco minimo: R$ $($consolidado.Resumo.PrecoMinimoIda)"
    Write-Host "  Preco maximo: R$ $($consolidado.Resumo.PrecoMaximoIda)"
}

Write-Host "`nVOOS DE VOLTA (GIG -> GRU em 16/10/2025):"
Write-Host "  Status: $(if($RespVolta.Success){'✓ Success'}else{'✗ Erro'})"
Write-Host "  Completed: $($RespVolta.Completed)"
Write-Host "  Total voos: $totalVolta"
if ($totalVolta -gt 0) {
    Write-Host "  Preco minimo: R$ $($consolidado.Resumo.PrecoMinimoVolta)"
    Write-Host "  Preco maximo: R$ $($consolidado.Resumo.PrecoMaximoVolta)"
}

if ($RespVolta.ExErro) {
    Write-Host "`n⚠️  ERRO NA VOLTA:" -ForegroundColor Yellow
    Write-Host "  Tipo: $($RespVolta.ExErro.ExceptionType)"
    Write-Host "  Mensagem: $($RespVolta.ExErro.Detail)" -ForegroundColor Red
}

Write-Host "`n=== ARQUIVOS GERADOS ===" -ForegroundColor Cyan
Write-Host "1. Voos IDA completo: $outputIda"
Write-Host "2. Voos VOLTA completo: $outputVolta"
Write-Host "3. Consolidado: $outputConsolidado"
