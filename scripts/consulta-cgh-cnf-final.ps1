$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Consulta CGH -> CNF com formato correto ===" -ForegroundColor Cyan
Write-Host "Ida: 2025-10-31 | Volta: 2025-11-01 | Companhia: -1`n" -ForegroundColor Yellow

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

# 2) Requisição de IDA
Write-Host "[2/3] Buscando voos de IDA (CGH -> CNF)..." -NoNewline

$BodyIda = @{
    Origem = 'CGH'
    Destino = 'CNF'
    Ida = '2025-10-31'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 1
    TipoViagem = 1
} | ConvertTo-Json -Compress

$RespIda = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $BodyIda -TimeoutSec 120
Write-Host " OK" -ForegroundColor Green

# 3) Requisição de VOLTA
Write-Host "[3/3] Buscando voos de VOLTA (CNF -> CGH)..." -NoNewline

$BodyVolta = @{
    Origem = 'CNF'
    Destino = 'CGH'
    Ida = '2025-11-01'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 1
    TipoViagem = 1
} | ConvertTo-Json -Compress

$RespVolta = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $BodyVolta -TimeoutSec 120
Write-Host " OK`n" -ForegroundColor Green

# Processar IDA
$idaCount = 0; $byCiaIda = @{}
if ($RespIda.Data) {
    foreach ($g in $RespIda.Data) {
        if ($g.flights) {
            $idaCount += ($g.flights | Measure-Object).Count
            foreach ($f in $g.flights) {
                $ciaName = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{$null}
                if ($ciaName) {
                    if ($byCiaIda.ContainsKey($ciaName)) { $byCiaIda[$ciaName] = [int]$byCiaIda[$ciaName] + 1 }
                    else { $byCiaIda[$ciaName] = 1 }
                }
            }
        }
    }
}

# Processar VOLTA
$voltaCount = 0; $byCiaVolta = @{}
if ($RespVolta.Data) {
    foreach ($g in $RespVolta.Data) {
        if ($g.flights) {
            $voltaCount += ($g.flights | Measure-Object).Count
            foreach ($f in $g.flights) {
                $ciaName = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{$null}
                if ($ciaName) {
                    if ($byCiaVolta.ContainsKey($ciaName)) { $byCiaVolta[$ciaName] = [int]$byCiaVolta[$ciaName] + 1 }
                    else { $byCiaVolta[$ciaName] = 1 }
                }
            }
        }
    }
}

Write-Host "=== RESULTADO FINAL ===" -ForegroundColor Green
Write-Host "Voos de IDA (CGH->CNF 31/10): $idaCount voos"
Write-Host "Voos de VOLTA (CNF->CGH 01/11): $voltaCount voos`n"

if ($byCiaIda.Count -gt 0) {
    Write-Host "IDA - Por Companhia:" -ForegroundColor Cyan
    foreach ($k in $byCiaIda.Keys) {
        Write-Host "  - $k : $($byCiaIda[$k]) voos"
    }
}

if ($byCiaVolta.Count -gt 0) {
    Write-Host "`nVOLTA - Por Companhia:" -ForegroundColor Cyan
    foreach ($k in $byCiaVolta.Keys) {
        Write-Host "  - $k : $($byCiaVolta[$k]) voos"
    }
}

# Amostra de voos de IDA
if ($idaCount -gt 0) {
    Write-Host "`nPrimeiros 5 voos de IDA:" -ForegroundColor Yellow
    $i = 0
    foreach ($g in $RespIda.Data) {
        if ($g.flights) {
            foreach ($f in $g.flights) {
                $i++; if ($i -gt 5) { break }
                $cia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'N/A'}
                $preco = if($f.fareGroup -and $f.fareGroup.priceWithTax){$f.fareGroup.priceWithTax}else{0}
                $saida = if($f.segments -and $f.segments.Count -gt 0){$f.segments[0].departureDate}else{'N/A'}
                $chegada = if($f.segments -and $f.segments.Count -gt 0){$f.segments[$f.segments.Count-1].arrivalDate}else{'N/A'}
                Write-Host "  $i. $cia - R$ $preco - $saida -> $chegada"
            }
            if ($i -gt 5) { break }
        }
    }
}

# JSON resumo
Write-Host "`n=== JSON RESUMO ===" -ForegroundColor Cyan
$summary = [pscustomobject]@{
    Origem = 'CGH'
    Destino = 'CNF'
    Ida = '2025-10-31'
    Volta = '2025-11-01'
    Companhia = -1
    VoosIda = $idaCount
    VoosVolta = $voltaCount
    CompanhiasIda = (@($byCiaIda.Keys | ForEach-Object { [pscustomobject]@{ nome = $_; voos = $byCiaIda[$_] } }))
    CompanhiasVolta = (@($byCiaVolta.Keys | ForEach-Object { [pscustomobject]@{ nome = $_; voos = $byCiaVolta[$_] } }))
    PrecoMinimoIda = if($RespIda.Data -and $RespIda.Data[0].MinPrice){$RespIda.Data[0].MinPrice}else{0}
    PrecoMaximoIda = if($RespIda.Data -and $RespIda.Data[0].MaxPrice){$RespIda.Data[0].MaxPrice}else{0}
}

$summary | ConvertTo-Json -Depth 6 -Compress
