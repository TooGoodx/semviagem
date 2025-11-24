$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Busca COMPLETA IDA E VOLTA - Todos os detalhes em JSON ===" -ForegroundColor Cyan
Write-Host "Rota: GRU <-> GIG" -ForegroundColor Yellow
Write-Host "Ida: 2025-10-09 | Volta: 2025-10-16" -ForegroundColor Yellow
Write-Host "Companhia: -1 (todas)`n" -ForegroundColor Yellow

# 1) Token
Write-Host "[1/5] Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# 2) Buscar voos de IDA
Write-Host "[2/5] Buscando voos de IDA (GRU -> GIG)..." -NoNewline

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

# Polling se necessário para IDA
if ($RespIda.Completed -eq $false -and $RespIda.ExErro -and $RespIda.ExErro.Extensions -and $RespIda.ExErro.Extensions.LeaseId) {
    $LeaseId = $RespIda.ExErro.Extensions.LeaseId
    Write-Host "`n  Polling IDA..." -NoNewline
    
    $maxTentativas = 20
    $tentativa = 0
    
    while ($RespIda.Completed -eq $false -and $tentativa -lt $maxTentativas) {
        $tentativa++
        Start-Sleep -Seconds 10
        
        $PollingBody = @{ LeaseId = $LeaseId } | ConvertTo-Json -Compress
        $RespIda = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $PollingBody -TimeoutSec 120
    }
}

Write-Host " OK ($($RespIda.TotalItens) voos)" -ForegroundColor Green

# 3) Buscar voos de VOLTA
Write-Host "[3/5] Buscando voos de VOLTA (GIG -> GRU)..." -NoNewline

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

# Polling se necessário para VOLTA
if ($RespVolta.Completed -eq $false -and $RespVolta.ExErro -and $RespVolta.ExErro.Extensions -and $RespVolta.ExErro.Extensions.LeaseId) {
    $LeaseId = $RespVolta.ExErro.Extensions.LeaseId
    Write-Host "`n  Polling VOLTA..." -NoNewline
    
    $maxTentativas = 20
    $tentativa = 0
    
    while ($RespVolta.Completed -eq $false -and $tentativa -lt $maxTentativas) {
        $tentativa++
        Start-Sleep -Seconds 10
        
        $PollingBody = @{ LeaseId = $LeaseId } | ConvertTo-Json -Compress
        $RespVolta = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $PollingBody -TimeoutSec 120
    }
}

Write-Host " OK ($($RespVolta.TotalItens) voos)" -ForegroundColor Green

# 4) Salvar respostas completas
Write-Host "[4/5] Salvando respostas completas..." -NoNewline

$outputIda = "C:\Users\Lenovo\CascadeProjects\buscadorReact\ida-gru-gig-completo.json"
$outputVolta = "C:\Users\Lenovo\CascadeProjects\buscadorReact\volta-gig-gru-completo.json"

$RespIda | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputIda -Encoding utf8
$RespVolta | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputVolta -Encoding utf8

Write-Host " OK" -ForegroundColor Green

# 5) Processar e estruturar dados
Write-Host "[5/5] Processando dados estruturados...`n" -ForegroundColor Green

# Processar IDA
$voosIda = @()
if ($RespIda.Data) {
    foreach ($g in $RespIda.Data) {
        if ($g.flights) {
            foreach ($f in $g.flights) {
                $vooObj = [pscustomobject]@{
                    TipoVoo = 'IDA'
                    Data = '2025-10-09'
                    Rota = 'GRU -> GIG'
                    Companhia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'N/A'}
                    CompanhiaIATA = if($f.validatingBy -and $f.validatingBy.iata){$f.validatingBy.iata}else{'N/A'}
                    PrecoComTaxa = if($f.fareGroup -and $f.fareGroup.priceWithTax){$f.fareGroup.priceWithTax}else{0}
                    PrecoSemTaxa = if($f.fareGroup -and $f.fareGroup.priceWithoutTax){$f.fareGroup.priceWithoutTax}else{0}
                    Moeda = if($f.fareGroup -and $f.fareGroup.currency){$f.fareGroup.currency}else{'N/A'}
                    NumeroSegmentos = if($f.segments){$f.segments.Count}else{0}
                    Segmentos = @()
                }
                
                if ($f.segments) {
                    foreach ($seg in $f.segments) {
                        $segObj = [pscustomobject]@{
                            Origem = $seg.departure
                            Destino = $seg.arrival
                            Saida = $seg.departureDate
                            Chegada = $seg.arrivalDate
                            Duracao = $seg.duration
                            NumeroParadas = $seg.numberOfStops
                            PontosAdulto = if($seg.PontosAdulto){$seg.PontosAdulto}else{0}
                            FidelityProgram = if($seg.FidelityProgram){$seg.FidelityProgram}else{'N/A'}
                            ValorSegmento = if($seg.ValorSegmento){$seg.ValorSegmento}else{0}
                            Legs = @()
                        }
                        
                        if ($seg.legs) {
                            foreach ($leg in $seg.legs) {
                                $segObj.Legs += [pscustomobject]@{
                                    CompanhiaOperadora = if($leg.operatedBy -and $leg.operatedBy.name){$leg.operatedBy.name}else{'N/A'}
                                    NumeroVoo = if($leg.flightNumber){$leg.flightNumber}else{0}
                                    Saida = $leg.departureDate
                                    Chegada = $leg.arrivalDate
                                    Duracao = $leg.duration
                                    ClasseAssento = if($leg.seatClass -and $leg.seatClass.description){$leg.seatClass.description}else{'N/A'}
                                }
                            }
                        }
                        
                        $vooObj.Segmentos += $segObj
                    }
                }
                
                $voosIda += $vooObj
            }
        }
    }
}

# Processar VOLTA
$voosVolta = @()
if ($RespVolta.Data) {
    foreach ($g in $RespVolta.Data) {
        if ($g.flights) {
            foreach ($f in $g.flights) {
                $vooObj = [pscustomobject]@{
                    TipoVoo = 'VOLTA'
                    Data = '2025-10-16'
                    Rota = 'GIG -> GRU'
                    Companhia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'N/A'}
                    CompanhiaIATA = if($f.validatingBy -and $f.validatingBy.iata){$f.validatingBy.iata}else{'N/A'}
                    PrecoComTaxa = if($f.fareGroup -and $f.fareGroup.priceWithTax){$f.fareGroup.priceWithTax}else{0}
                    PrecoSemTaxa = if($f.fareGroup -and $f.fareGroup.priceWithoutTax){$f.fareGroup.priceWithoutTax}else{0}
                    Moeda = if($f.fareGroup -and $f.fareGroup.currency){$f.fareGroup.currency}else{'N/A'}
                    NumeroSegmentos = if($f.segments){$f.segments.Count}else{0}
                    Segmentos = @()
                }
                
                if ($f.segments) {
                    foreach ($seg in $f.segments) {
                        $segObj = [pscustomobject]@{
                            Origem = $seg.departure
                            Destino = $seg.arrival
                            Saida = $seg.departureDate
                            Chegada = $seg.arrivalDate
                            Duracao = $seg.duration
                            NumeroParadas = $seg.numberOfStops
                            PontosAdulto = if($seg.PontosAdulto){$seg.PontosAdulto}else{0}
                            FidelityProgram = if($seg.FidelityProgram){$seg.FidelityProgram}else{'N/A'}
                            ValorSegmento = if($seg.ValorSegmento){$seg.ValorSegmento}else{0}
                            Legs = @()
                        }
                        
                        if ($seg.legs) {
                            foreach ($leg in $seg.legs) {
                                $segObj.Legs += [pscustomobject]@{
                                    CompanhiaOperadora = if($leg.operatedBy -and $leg.operatedBy.name){$leg.operatedBy.name}else{'N/A'}
                                    NumeroVoo = if($leg.flightNumber){$leg.flightNumber}else{0}
                                    Saida = $leg.departureDate
                                    Chegada = $leg.arrivalDate
                                    Duracao = $leg.duration
                                    ClasseAssento = if($leg.seatClass -and $leg.seatClass.description){$leg.seatClass.description}else{'N/A'}
                                }
                            }
                        }
                        
                        $vooObj.Segmentos += $segObj
                    }
                }
                
                $voosVolta += $vooObj
            }
        }
    }
}

# Salvar estruturados
$outputIdaEstruturado = "C:\Users\Lenovo\CascadeProjects\buscadorReact\ida-estruturado.json"
$outputVoltaEstruturado = "C:\Users\Lenovo\CascadeProjects\buscadorReact\volta-estruturado.json"
$outputTodosVoos = "C:\Users\Lenovo\CascadeProjects\buscadorReact\todos-voos-ida-volta.json"

$voosIda | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputIdaEstruturado -Encoding utf8
$voosVolta | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputVoltaEstruturado -Encoding utf8

$todosVoos = [pscustomobject]@{
    Parametros = [pscustomobject]@{
        Origem = 'GRU'
        Destino = 'GIG'
        DataIda = '2025-10-09'
        DataVolta = '2025-10-16'
        Companhia = -1
        Classe = 'Economica'
    }
    VoosIda = $voosIda
    VoosVolta = $voosVolta
    Resumo = [pscustomobject]@{
        TotalVoosIda = $voosIda.Count
        TotalVoosVolta = $voosVolta.Count
        PrecoMinimoIda = if($RespIda.Data -and $RespIda.Data[0].MinPrice){$RespIda.Data[0].MinPrice}else{0}
        PrecoMaximoIda = if($RespIda.Data -and $RespIda.Data[0].MaxPrice){$RespIda.Data[0].MaxPrice}else{0}
        PrecoMinimoVolta = if($RespVolta.Data -and $RespVolta.Data[0].MinPrice){$RespVolta.Data[0].MinPrice}else{0}
        PrecoMaximoVolta = if($RespVolta.Data -and $RespVolta.Data[0].MaxPrice){$RespVolta.Data[0].MaxPrice}else{0}
    }
}

$todosVoos | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputTodosVoos -Encoding utf8

# Resumo final
Write-Host "=== RESUMO FINAL ===" -ForegroundColor Green
Write-Host "`nVOOS DE IDA (GRU -> GIG em 09/10/2025):"
Write-Host "  Total: $($voosIda.Count) voos"
Write-Host "  Preco minimo: R$ $($todosVoos.Resumo.PrecoMinimoIda)"
Write-Host "  Preco maximo: R$ $($todosVoos.Resumo.PrecoMaximoIda)"

Write-Host "`nVOOS DE VOLTA (GIG -> GRU em 16/10/2025):"
Write-Host "  Total: $($voosVolta.Count) voos"
Write-Host "  Preco minimo: R$ $($todosVoos.Resumo.PrecoMinimoVolta)"
Write-Host "  Preco maximo: R$ $($todosVoos.Resumo.PrecoMaximoVolta)"

Write-Host "`n=== ARQUIVOS GERADOS ===" -ForegroundColor Yellow
Write-Host "1. Resposta RAW IDA:"
Write-Host "   $outputIda" -ForegroundColor White
Write-Host "`n2. Resposta RAW VOLTA:"
Write-Host "   $outputVolta" -ForegroundColor White
Write-Host "`n3. Voos IDA estruturados:"
Write-Host "   $outputIdaEstruturado" -ForegroundColor White
Write-Host "`n4. Voos VOLTA estruturados:"
Write-Host "   $outputVoltaEstruturado" -ForegroundColor White
Write-Host "`n5. TODOS OS VOOS (IDA + VOLTA consolidado):"
Write-Host "   $outputTodosVoos" -ForegroundColor White
Write-Host "`nAbra com: code <caminho-do-arquivo>" -ForegroundColor Gray
