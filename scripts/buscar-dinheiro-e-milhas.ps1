$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Buscando voos: DINHEIRO e MILHAS ===" -ForegroundColor Cyan
Write-Host "Rota: GRU -> GIG | Data: 2025-10-09 | Companhia: -1`n" -ForegroundColor Yellow

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

# 2) Buscar todos os voos (a API retorna ambos)
Write-Host "[2/3] Buscando todos os voos..." -NoNewline

$Body = @{
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

$Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 120
Write-Host " OK`n" -ForegroundColor Green

# 3) Separar voos por tipo de pagamento
Write-Host "[3/3] Processando resultados...`n" -ForegroundColor Green

$voosDinheiro = @()
$voosMilhas = @()
$totalVoos = 0

if ($Resp.Data) {
    foreach ($g in $Resp.Data) {
        if ($g.flights) {
            foreach ($f in $g.flights) {
                $totalVoos++
                
                # Verificar se tem pontos (milhas)
                $temPontos = $false
                if ($f.segments) {
                    foreach ($seg in $f.segments) {
                        if ($seg.PontosAdulto -and $seg.PontosAdulto -gt 0) {
                            $temPontos = $true
                            break
                        }
                    }
                }
                
                # Criar objeto de voo
                $vooObj = [pscustomobject]@{
                    Companhia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'N/A'}
                    Preco = if($f.fareGroup -and $f.fareGroup.priceWithTax){$f.fareGroup.priceWithTax}else{0}
                    Origem = if($f.segments -and $f.segments.Count -gt 0){$f.segments[0].departure}else{'N/A'}
                    Destino = if($f.segments -and $f.segments.Count -gt 0){$f.segments[$f.segments.Count-1].arrival}else{'N/A'}
                    Saida = if($f.segments -and $f.segments.Count -gt 0){$f.segments[0].departureDate}else{'N/A'}
                    Chegada = if($f.segments -and $f.segments.Count -gt 0){$f.segments[$f.segments.Count-1].arrivalDate}else{'N/A'}
                    Pontos = if($temPontos -and $f.segments -and $f.segments.Count -gt 0){$f.segments[0].PontosAdulto}else{0}
                    TipoPagamento = if($temPontos){'Milhas'}else{'Dinheiro'}
                }
                
                if ($temPontos) {
                    $voosMilhas += $vooObj
                } else {
                    $voosDinheiro += $vooObj
                }
            }
        }
    }
}

# Exibir resumo
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "Total de voos: $totalVoos"
Write-Host "Voos pagamento DINHEIRO: $($voosDinheiro.Count)"
Write-Host "Voos pagamento MILHAS: $($voosMilhas.Count)`n"

# Voos por DINHEIRO
if ($voosDinheiro.Count -gt 0) {
    Write-Host "=== VOOS PAGAMENTO EM DINHEIRO (Top 5) ===" -ForegroundColor Cyan
    $i = 0
    foreach ($v in ($voosDinheiro | Sort-Object Preco | Select-Object -First 5)) {
        $i++
        Write-Host "  $i. $($v.Companhia) - R$ $($v.Preco) - $($v.Saida)"
    }
    Write-Host ""
}

# Voos por MILHAS
if ($voosMilhas.Count -gt 0) {
    Write-Host "=== VOOS PAGAMENTO EM MILHAS (Top 5) ===" -ForegroundColor Cyan
    $i = 0
    foreach ($v in ($voosMilhas | Sort-Object Pontos | Select-Object -First 5)) {
        $i++
        Write-Host "  $i. $($v.Companhia) - $($v.Pontos) pontos - $($v.Saida)"
    }
    Write-Host ""
}

# JSON Resumo
Write-Host "=== JSON RESUMO ===" -ForegroundColor Yellow
$summary = [pscustomobject]@{
    Rota = 'GRU -> GIG'
    Data = '2025-10-09'
    TotalVoos = $totalVoos
    VoosDinheiro = $voosDinheiro.Count
    VoosMilhas = $voosMilhas.Count
    MenorPrecoDinheiro = if($voosDinheiro.Count -gt 0){($voosDinheiro | Sort-Object Preco | Select-Object -First 1).Preco}else{0}
    MenorPontosMilhas = if($voosMilhas.Count -gt 0){($voosMilhas | Sort-Object Pontos | Select-Object -First 1).Pontos}else{0}
}

$summary | ConvertTo-Json -Compress
