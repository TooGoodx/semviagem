$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# URL CORRETA que o site SemViagem.com usa em produção
$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/moblix-api'

Write-Host "=== Testando com funcao moblix-api (usado pelo SemViagem.com) ===" -ForegroundColor Cyan
Write-Host "Rota: CGH -> CNF | Data: 2025-10-31 | Volta: 2025-11-01`n" -ForegroundColor Yellow

# 1) Token
Write-Host "Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK`n" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# 2) Corpo da requisição (formato exato do SemViagem)
$Body = @{
    Origem = 'CGH'
    Destino = 'CNF'
    Ida = '2025-10-31'
    Volta = '2025-11-01'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 'Y'
    TipoClasse = 'Economy'
    ClasseVoo = 'ECONOMICA'
} | ConvertTo-Json -Compress

Write-Host "Enviando requisicao para /api/ConsultaAereo/Consultar..." -NoNewline
try {
    $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 120
    Write-Host " OK`n" -ForegroundColor Green
    
    # Processar resultado
    $groups = 0; $idaCount = 0; $voltaCount = 0; $byCia = @{}
    
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
            if ($g.Volta) { $voltaCount += ($g.Volta | Measure-Object).Count }
        }
    }
    
    Write-Host "=== RESULTADO ===" -ForegroundColor Green
    Write-Host "Grupos: $groups"
    Write-Host "Voos de Ida: $idaCount"
    Write-Host "Voos de Volta: $voltaCount`n"
    
    if ($byCia.Count -gt 0) {
        Write-Host "Por Companhia:" -ForegroundColor Cyan
        foreach ($k in $byCia.Keys) {
            Write-Host "  - $k : $($byCia[$k]) voos"
        }
    } else {
        Write-Host "Nenhum voo encontrado" -ForegroundColor Yellow
    }
    
    if ($idaCount -gt 0 -and $Resp.Data[0].Ida) {
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
    
    # JSON
    Write-Host "`n=== JSON ===" -ForegroundColor Cyan
    $companyArr = @()
    foreach ($k in $byCia.Keys) { $companyArr += [pscustomobject]@{ companhia = $k; voos = $byCia[$k] } }
    
    $summary = [pscustomobject]@{
        Origem = 'CGH'
        Destino = 'CNF'
        Ida = '2025-10-31'
        Volta = '2025-11-01'
        Companhia = -1
        Grupos = $groups
        VoosIda = $idaCount
        VoosVolta = $voltaCount
        PorCompanhia = $companyArr
    }
    
    $summary | ConvertTo-Json -Depth 5 -Compress
    
} catch {
    Write-Host " ERRO`n" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}
