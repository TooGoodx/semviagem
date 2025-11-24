$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Replicando formato do SemViagem.com ===" -ForegroundColor Cyan
Write-Host "Origem: CGH | Destino: CNF | Ida: 2025-10-31 | Volta: 2025-11-01 | Companhia: -1`n" -ForegroundColor Yellow

# 1) Token com headers corretos (igual ao site)
Write-Host "Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
if (-not $token) { throw "Falha ao obter token" }
Write-Host " OK`n" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# 2) Parâmetros EXATAMENTE como o SemViagem monta (moblixApiService.ts linhas 247-310)
# Incluindo Classe, TipoClasse, ClasseVoo que o código TypeScript adiciona
$Body = @{
    Origem = 'CGH'
    Destino = 'CNF'
    Ida = '2025-10-31'
    Volta = '2025-11-01'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 'Y'                    # Código IATA para econômica
    TipoClasse = 'Economy'          # Nome completo
    ClasseVoo = 'ECONOMICA'         # Nome em português
} | ConvertTo-Json -Compress

Write-Host "Corpo da Requisição:" -ForegroundColor Cyan
Write-Host $Body -ForegroundColor Gray
Write-Host ""

# 3) Fazer requisição
Write-Host "Enviando requisição para API Moblix..." -NoNewline
try {
    $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 120
    Write-Host " OK`n" -ForegroundColor Green
    
    # 4) Processar resultado
    $groups = 0; $idaCount = 0; $voltaCount = 0; $byCia = @{}
    
    if ($Resp.Data) {
        $groups = ($Resp.Data | Measure-Object).Count
        Write-Host "Grupos retornados: $groups" -ForegroundColor Cyan
        
        foreach ($g in $Resp.Data) {
            if ($g.Ida) {
                $count = ($g.Ida | Measure-Object).Count
                $idaCount += $count
                Write-Host "  - Grupo com $count voos de ida" -ForegroundColor Gray
                
                # Contabilizar por companhia
                foreach ($f in $g.Ida) {
                    $ciaName = $null
                    if ($f.Cia -and $f.Cia.Nome) { $ciaName = $f.Cia.Nome }
                    elseif ($f.CompanhiaAerea)   { $ciaName = $f.CompanhiaAerea }
                    if ($ciaName) {
                        if ($byCia.ContainsKey($ciaName)) { $byCia[$ciaName] = [int]$byCia[$ciaName] + 1 }
                        else { $byCia[$ciaName] = 1 }
                    }
                }
            }
            if ($g.Volta) {
                $count = ($g.Volta | Measure-Object).Count
                $voltaCount += $count
                Write-Host "  - Grupo com $count voos de volta" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "`n=== RESUMO ===" -ForegroundColor Green
    Write-Host "Total de Grupos: $groups"
    Write-Host "Total de Voos de Ida: $idaCount"
    Write-Host "Total de Voos de Volta: $voltaCount"
    
    if ($byCia.Count -gt 0) {
        Write-Host "`nPor Companhia:" -ForegroundColor Cyan
        foreach ($k in $byCia.Keys) {
            Write-Host "  - $k : $($byCia[$k]) voos"
        }
    }
    
    # Amostra de voos
    if ($idaCount -gt 0 -and $Resp.Data[0].Ida) {
        Write-Host "`nAmostra (primeiros 3 voos):" -ForegroundColor Cyan
        $i = 0
        foreach ($f in $Resp.Data[0].Ida) {
            $i++; if ($i -gt 3) { break }
            $cia = if($f.Cia -and $f.Cia.Nome){$f.Cia.Nome}elseif($f.CompanhiaAerea){$f.CompanhiaAerea}else{'N/A'}
            $preco = if($f.ValorTotalComTaxa){$f.ValorTotalComTaxa}elseif($f.ValorTotal){$f.ValorTotal}else{0}
            $voo = if($f.FlightCode){$f.FlightCode}else{'N/A'}
            $saida = if($f.Saida){$f.Saida}else{'N/A'}
            $chegada = if($f.Chegada){$f.Chegada}else{'N/A'}
            Write-Host "  $i. $cia $voo - R$ $preco - $saida -> $chegada"
        }
    }
    
    # Criar JSON de resposta
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
    
    Write-Host "`n=== JSON ===" -ForegroundColor Cyan
    $summary | ConvertTo-Json -Depth 5 -Compress
    
}
catch {
    Write-Host " ERRO`n" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "StackTrace: $($_.Exception.StackTrace)" -ForegroundColor Gray
}
