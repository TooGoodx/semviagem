$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Replicando comportamento EXATO do SemViagem.com com POLLING ===" -ForegroundColor Cyan
Write-Host "Rota: GRU -> GIG | Data: 2025-10-02 (HOJE)`n" -ForegroundColor Yellow

# 1) Token
Write-Host "[1] Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# 2) Requisição inicial (formato EXATO do site)
Write-Host "[2] Enviando requisicao inicial..." -NoNewline

$Body = @{
    Origem = 'GRU'
    Destino = 'GIG'
    Ida = '2025-10-02'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 1              # NUMERO, não string!
    TipoViagem = 1          # Campo adicional do site
} | ConvertTo-Json -Compress

$Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 120
Write-Host " OK`n" -ForegroundColor Green

# 3) Extrair LeaseId e fazer polling
if ($Resp.Data -and $Resp.Data.Count -gt 0 -and $Resp.Data[0].LeaseId) {
    $LeaseId = $Resp.Data[0].LeaseId
    Write-Host "[3] LeaseId recebido: $LeaseId" -ForegroundColor Cyan
    Write-Host "[4] Iniciando polling ate Completed=true...`n" -ForegroundColor Yellow
    
    $maxTentativas = 20
    $tentativa = 0
    $completed = $false
    
    while (-not $completed -and $tentativa -lt $maxTentativas) {
        $tentativa++
        Write-Host "  Polling $tentativa/$maxTentativas - Aguardando 10s..." -NoNewline
        Start-Sleep -Seconds 10
        
        # Polling com LeaseId
        $PollingBody = @{
            LeaseId = $LeaseId
        } | ConvertTo-Json -Compress
        
        try {
            $PollResp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $PollingBody -TimeoutSec 120
            
            if ($PollResp.Completed) {
                $completed = $true
                Write-Host " COMPLETED!" -ForegroundColor Green
                
                # Processar resultado
                $idaCount = 0; $byCia = @{}
                
                if ($PollResp.Data) {
                    foreach ($g in $PollResp.Data) {
                        if ($g.flights) {
                            # Estrutura 'flights' (formato novo)
                            $idaCount += ($g.flights | Measure-Object).Count
                            foreach ($f in $g.flights) {
                                $ciaName = $null
                                if ($f.validatingBy -and $f.validatingBy.name) { $ciaName = $f.validatingBy.name }
                                if ($ciaName) {
                                    if ($byCia.ContainsKey($ciaName)) { $byCia[$ciaName] = [int]$byCia[$ciaName] + 1 }
                                    else { $byCia[$ciaName] = 1 }
                                }
                            }
                        } elseif ($g.Ida) {
                            # Estrutura 'Ida' (formato antigo)
                            $idaCount += ($g.Ida | Measure-Object).Count
                            foreach ($f in $g.Ida) {
                                $ciaName = $null
                                if ($f.Cia -and $f.Cia.Nome) { $ciaName = $f.Cia.Nome }
                                elseif ($f.CompanhiaAerea) { $ciaName = $f.CompanhiaAerea }
                                if ($ciaName) {
                                    if ($byCia.ContainsKey($ciaName)) { $byCia[$ciaName] = [int]$byCia[$ciaName] + 1 }
                                    else { $byCia[$ciaName] = 1 }
                                }
                            }
                        }
                    }
                }
                
                Write-Host "`n=== SUCESSO ===" -ForegroundColor Green
                Write-Host "Total de voos encontrados: $idaCount`n"
                
                if ($byCia.Count -gt 0) {
                    Write-Host "Por Companhia:" -ForegroundColor Cyan
                    foreach ($k in $byCia.Keys) {
                        Write-Host "  - $k : $($byCia[$k]) voos"
                    }
                }
                
                # Mostrar primeiros 5 voos
                if ($idaCount -gt 0) {
                    Write-Host "`nPrimeiros 5 voos:" -ForegroundColor Cyan
                    $i = 0
                    
                    foreach ($g in $PollResp.Data) {
                        if ($g.flights) {
                            foreach ($f in $g.flights) {
                                $i++; if ($i -gt 5) { break }
                                $cia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'N/A'}
                                $preco = if($f.fareGroup -and $f.fareGroup.priceWithTax){$f.fareGroup.priceWithTax}else{0}
                                $origem = if($f.segments -and $f.segments.Count -gt 0){$f.segments[0].departure}else{'N/A'}
                                $destino = if($f.segments -and $f.segments.Count -gt 0){$f.segments[0].arrival}else{'N/A'}
                                $saida = if($f.segments -and $f.segments.Count -gt 0){$f.segments[0].departureDate}else{'N/A'}
                                Write-Host "  $i. $cia - R$ $preco - $origem->$destino - $saida"
                            }
                            if ($i -gt 5) { break }
                        }
                    }
                }
                
            } else {
                Write-Host " Completed=false (continuando...)" -ForegroundColor Gray
            }
            
        } catch {
            Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
            break
        }
    }
    
    if (-not $completed) {
        Write-Host "`n⚠️  Timeout: Nao completou apos $maxTentativas tentativas" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "[3] ⚠️  LeaseId nao encontrado na resposta inicial" -ForegroundColor Yellow
    Write-Host "Resposta recebida: $($Resp | ConvertTo-Json -Depth 3 -Compress)"
}
