$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Busca COMPLETA com POLLING - Todos os detalhes em JSON ===" -ForegroundColor Cyan
Write-Host "Rota: GRU -> GIG | Data: 2025-10-09 | Companhia: -1`n" -ForegroundColor Yellow

# 1) Token
Write-Host "[1/4] Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# 2) Requisição inicial
Write-Host "[2/4] Enviando requisicao inicial..." -NoNewline

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
Write-Host " OK" -ForegroundColor Green

# 3) Verificar se precisa de polling
if ($Resp.Completed -eq $false -and $Resp.ExErro -and $Resp.ExErro.Extensions -and $Resp.ExErro.Extensions.LeaseId) {
    $LeaseId = $Resp.ExErro.Extensions.LeaseId
    Write-Host "[3/4] Polling necessario. LeaseId: $LeaseId" -ForegroundColor Yellow
    
    $maxTentativas = 20
    $tentativa = 0
    $completed = $false
    
    while (-not $completed -and $tentativa -lt $maxTentativas) {
        $tentativa++
        Write-Host "  Tentativa $tentativa/$maxTentativas - Aguardando 10s..." -NoNewline
        Start-Sleep -Seconds 10
        
        $PollingBody = @{
            LeaseId = $LeaseId
        } | ConvertTo-Json -Compress
        
        try {
            $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $PollingBody -TimeoutSec 120
            
            if ($Resp.Completed) {
                $completed = $true
                Write-Host " COMPLETED!" -ForegroundColor Green
            } else {
                Write-Host " aguardando..." -ForegroundColor Gray
            }
        } catch {
            Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
            break
        }
    }
    
    if (-not $completed) {
        Write-Host "`n⚠️  Timeout: Busca nao completou" -ForegroundColor Yellow
        exit 1
    }
} elseif ($Resp.Completed) {
    Write-Host "[3/4] Resposta ja completada (sem polling necessario)" -ForegroundColor Green
} else {
    Write-Host "[3/4] ⚠️  Resposta invalida" -ForegroundColor Yellow
}

# 4) Salvar resposta completa
$outputFile = "C:\Users\Lenovo\CascadeProjects\buscadorReact\resposta-completa-api-detalhada.json"
Write-Host "[4/4] Salvando resposta COMPLETA..." -NoNewline

$jsonCompleto = $Resp | ConvertTo-Json -Depth 100
$jsonCompleto | Out-File -FilePath $outputFile -Encoding utf8

Write-Host " OK`n" -ForegroundColor Green

# Análise detalhada
$totalVoos = 0
$companhias = @{}
$voosPorSegmentos = @()

if ($Resp.Data) {
    foreach ($g in $Resp.Data) {
        if ($g.flights) {
            foreach ($f in $g.flights) {
                $totalVoos++
                
                $cia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'Desconhecida'}
                if ($companhias.ContainsKey($cia)) {
                    $companhias[$cia] = $companhias[$cia] + 1
                } else {
                    $companhias[$cia] = 1
                }
                
                # Extrair informações detalhadas de cada voo
                $vooDetalhado = [pscustomobject]@{
                    Companhia = $cia
                    CompanhiaIATA = if($f.validatingBy -and $f.validatingBy.iata){$f.validatingBy.iata}else{'N/A'}
                    PrecoComTaxa = if($f.fareGroup -and $f.fareGroup.priceWithTax){$f.fareGroup.priceWithTax}else{0}
                    PrecoSemTaxa = if($f.fareGroup -and $f.fareGroup.priceWithoutTax){$f.fareGroup.priceWithoutTax}else{0}
                    Moeda = if($f.fareGroup -and $f.fareGroup.currency){$f.fareGroup.currency}else{'N/A'}
                    NumeroSegmentos = if($f.segments){$f.segments.Count}else{0}
                    Segmentos = @()
                }
                
                if ($f.segments) {
                    foreach ($seg in $f.segments) {
                        $segDetalhado = [pscustomobject]@{
                            Origem = $seg.departure
                            Destino = $seg.arrival
                            Saida = $seg.departureDate
                            Chegada = $seg.arrivalDate
                            Duracao = $seg.duration
                            NumeroParadas = $seg.numberOfStops
                            PontosAdulto = if($seg.PontosAdulto){$seg.PontosAdulto}else{0}
                            PontosCrianca = if($seg.PontosCrianca){$seg.PontosCrianca}else{0}
                            FidelityProgram = if($seg.FidelityProgram){$seg.FidelityProgram}else{'N/A'}
                            ValorSegmento = if($seg.ValorSegmento){$seg.ValorSegmento}else{0}
                            Legs = @()
                        }
                        
                        if ($seg.legs) {
                            foreach ($leg in $seg.legs) {
                                $legDetalhado = [pscustomobject]@{
                                    CompanhiaOperadora = if($leg.operatedBy -and $leg.operatedBy.name){$leg.operatedBy.name}else{'N/A'}
                                    NumeroVoo = if($leg.flightNumber){$leg.flightNumber}else{0}
                                    Origem = $leg.departure
                                    Destino = $leg.arrival
                                    Saida = $leg.departureDate
                                    Chegada = $leg.arrivalDate
                                    Duracao = $leg.duration
                                    ClasseAssento = if($leg.seatClass -and $leg.seatClass.description){$leg.seatClass.description}else{'N/A'}
                                }
                                $segDetalhado.Legs += $legDetalhado
                            }
                        }
                        
                        $vooDetalhado.Segmentos += $segDetalhado
                    }
                }
                
                $voosPorSegmentos += $vooDetalhado
            }
        }
    }
}

Write-Host "=== RESUMO GERAL ===" -ForegroundColor Green
Write-Host "Arquivo salvo: $outputFile"
Write-Host "Tamanho: $([math]::Round((Get-Item $outputFile).Length / 1KB, 2)) KB"
Write-Host "Total de voos: $totalVoos`n"

if ($companhias.Count -gt 0) {
    Write-Host "Por Companhia:" -ForegroundColor Cyan
    foreach ($k in $companhias.Keys) {
        Write-Host "  - $k : $($companhias[$k]) voos"
    }
    Write-Host ""
}

if ($Resp.Data -and $Resp.Data[0]) {
    Write-Host "Faixa de Precos:" -ForegroundColor Cyan
    Write-Host "  - Minimo: R$ $($Resp.Data[0].MinPrice)"
    Write-Host "  - Maximo: R$ $($Resp.Data[0].MaxPrice)"
    Write-Host "  - Medio: R$ $($Resp.Data[0].AveragePrice)"
    Write-Host ""
}

# Salvar também versão estruturada
$outputFileEstruturado = "C:\Users\Lenovo\CascadeProjects\buscadorReact\voos-estruturados.json"
$voosPorSegmentos | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputFileEstruturado -Encoding utf8

Write-Host "=== ARQUIVOS GERADOS ===" -ForegroundColor Yellow
Write-Host "1. Resposta RAW da API (completa):"
Write-Host "   $outputFile" -ForegroundColor White
Write-Host "`n2. Voos estruturados (facil leitura):"
Write-Host "   $outputFileEstruturado" -ForegroundColor White
Write-Host "`nAbra com: code <caminho-do-arquivo>" -ForegroundColor Gray
