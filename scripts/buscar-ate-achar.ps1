$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Buscando voos ate encontrar resultados ===" -ForegroundColor Cyan
Write-Host "Testando multiplas estrategias...`n" -ForegroundColor Yellow

# Token
Write-Host "[1/3] Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# Estratégias de teste
$estrategias = @(
    @{ Origem='GRU'; Destino='GIG'; Dias=7; Desc='GRU->GIG (+7 dias)' },
    @{ Origem='GRU'; Destino='GIG'; Dias=10; Desc='GRU->GIG (+10 dias)' },
    @{ Origem='GRU'; Destino='GIG'; Dias=14; Desc='GRU->GIG (+14 dias)' },
    @{ Origem='GRU'; Destino='BSB'; Dias=7; Desc='GRU->BSB (+7 dias)' },
    @{ Origem='GRU'; Destino='BSB'; Dias=10; Desc='GRU->BSB (+10 dias)' },
    @{ Origem='CGH'; Destino='GIG'; Dias=7; Desc='CGH->GIG (+7 dias)' },
    @{ Origem='CGH'; Destino='BSB'; Dias=7; Desc='CGH->BSB (+7 dias)' },
    @{ Origem='CGH'; Destino='CNF'; Dias=7; Desc='CGH->CNF (+7 dias)' },
    @{ Origem='GRU'; Destino='FOR'; Dias=10; Desc='GRU->FOR (+10 dias)' },
    @{ Origem='GRU'; Destino='REC'; Dias=10; Desc='GRU->REC (+10 dias)' }
)

$encontrado = $false
$tentativa = 0

Write-Host "[2/3] Testando estratégias...`n" -ForegroundColor Green

foreach ($est in $estrategias) {
    if ($encontrado) { break }
    
    $tentativa++
    $dataIda = (Get-Date).AddDays($est.Dias).ToString('yyyy-MM-dd')
    
    Write-Host "[$tentativa/$($estrategias.Count)] Testando: $($est.Desc) | Data: $dataIda" -NoNewline
    
    $Body = @{
        Origem = $est.Origem
        Destino = $est.Destino
        Ida = $dataIda
        Adultos = 1
        Criancas = 0
        Bebes = 0
        Companhia = -1
        Classe = 'Y'
        TipoClasse = 'Economy'
        ClasseVoo = 'ECONOMICA'
    } | ConvertTo-Json -Compress
    
    try {
        $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 90
        
        $groups = 0; $idaCount = 0; $byCia = @{}
        
        if ($Resp.Data) {
            $groups = ($Resp.Data | Measure-Object).Count
            foreach ($g in $Resp.Data) {
                if ($g.Ida) {
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
        
        if ($idaCount -gt 0) {
            Write-Host " [OK] ENCONTRADO! $idaCount voos" -ForegroundColor Green
            $encontrado = $true
            
            Write-Host "`n=== SUCESSO ===" -ForegroundColor Green
            Write-Host "Rota: $($est.Origem) -> $($est.Destino)"
            Write-Host "Data: $dataIda"
            Write-Host "Grupos: $groups"
            Write-Host "Voos de Ida: $idaCount`n"
            
            if ($byCia.Count -gt 0) {
                Write-Host "Por Companhia:" -ForegroundColor Cyan
                foreach ($k in $byCia.Keys) {
                    Write-Host "  - $k : $($byCia[$k]) voos"
                }
            }
            
            if ($Resp.Data[0].Ida) {
                Write-Host "`nPrimeiros 5 voos:" -ForegroundColor Cyan
                $i = 0
                foreach ($f in $Resp.Data[0].Ida) {
                    $i++; if ($i -gt 5) { break }
                    $cia = if($f.Cia -and $f.Cia.Nome){$f.Cia.Nome}elseif($f.CompanhiaAerea){$f.CompanhiaAerea}else{'N/A'}
                    $preco = if($f.ValorTotalComTaxa){$f.ValorTotalComTaxa}elseif($f.ValorTotal){$f.ValorTotal}else{0}
                    $voo = if($f.FlightCode){$f.FlightCode}else{'N/A'}
                    $saida = if($f.Saida){$f.Saida}else{'N/A'}
                    $chegada = if($f.Chegada){$f.Chegada}else{'N/A'}
                    Write-Host "  $i. $cia $voo - R$ $preco - $saida -> $chegada"
                }
            }
            
            # JSON final
            Write-Host "`n[3/3] JSON Resultado:" -ForegroundColor Green
            $companyArr = @()
            foreach ($k in $byCia.Keys) { $companyArr += [pscustomobject]@{ companhia = $k; voos = $byCia[$k] } }
            
            $summary = [pscustomobject]@{
                Origem = $est.Origem
                Destino = $est.Destino
                Ida = $dataIda
                Companhia = -1
                Completed = $true
                Grupos = $groups
                VoosIda = $idaCount
                PorCompanhia = $companyArr
            }
            
            $summary | ConvertTo-Json -Depth 5 -Compress
            
        } else {
            Write-Host " [X] 0 voos" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host " [X] ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if (-not $encontrado) {
    Write-Host "`n-- Nenhuma estrategia retornou voos" -ForegroundColor Yellow
    Write-Host "Total de tentativas: $tentativa" -ForegroundColor Gray
}
