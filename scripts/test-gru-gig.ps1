$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Testando: GRU -> GIG | 2025-10-10 | Companhia -1 ===" -ForegroundColor Cyan

# Token
Write-Host "Obtendo Token..." -NoNewline
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host " OK" -ForegroundColor Green

$Headers = @{
    Accept = 'application/json'
    'Content-Type' = 'application/json'
    Authorization = "Bearer $token"
}

# Corpo da requisição (formato SemViagem)
$Body = @{
    Origem = 'GRU'
    Destino = 'GIG'
    Ida = '2025-10-10'
    Adultos = 1
    Criancas = 0
    Bebes = 0
    Companhia = -1
    Classe = 'Y'
    TipoClasse = 'Economy'
    ClasseVoo = 'ECONOMICA'
} | ConvertTo-Json -Compress

# Requisição
Write-Host "Enviando requisição..." -NoNewline
$Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 120
Write-Host " OK`n" -ForegroundColor Green

# Processar resultado
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

Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "Grupos: $groups"
Write-Host "Voos de Ida: $idaCount`n"

if ($byCia.Count -gt 0) {
    Write-Host "Por Companhia:" -ForegroundColor Cyan
    foreach ($k in $byCia.Keys) {
        Write-Host "  - $k : $($byCia[$k]) voos"
    }
}

if ($idaCount -gt 0 -and $Resp.Data[0].Ida) {
    Write-Host "`nAmostra (3 primeiros voos):" -ForegroundColor Cyan
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

if ($idaCount -eq 0) {
    Write-Host "`n⚠️  Nenhum voo encontrado para esta rota/data" -ForegroundColor Yellow
}
