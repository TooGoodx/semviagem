$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Buscando e salvando resposta COMPLETA da API ===" -ForegroundColor Cyan
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

# 2) Buscar voos
Write-Host "[2/3] Buscando voos..." -NoNewline

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

# 3) Salvar resposta completa
$outputFile = "C:\Users\Lenovo\CascadeProjects\buscadorReact\resposta-completa-api.json"
Write-Host "[3/3] Salvando resposta completa em JSON..." -NoNewline

# Converter para JSON com profundidade máxima
$jsonCompleto = $Resp | ConvertTo-Json -Depth 100
$jsonCompleto | Out-File -FilePath $outputFile -Encoding utf8

Write-Host " OK`n" -ForegroundColor Green

# Estatísticas
$totalVoos = 0
$companhias = @{}

if ($Resp.Data) {
    foreach ($g in $Resp.Data) {
        if ($g.flights) {
            $totalVoos += ($g.flights | Measure-Object).Count
            
            foreach ($f in $g.flights) {
                $cia = if($f.validatingBy -and $f.validatingBy.name){$f.validatingBy.name}else{'Desconhecida'}
                if ($companhias.ContainsKey($cia)) {
                    $companhias[$cia] = $companhias[$cia] + 1
                } else {
                    $companhias[$cia] = 1
                }
            }
        }
    }
}

Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "Arquivo salvo em: $outputFile"
Write-Host "Tamanho do arquivo: $([math]::Round((Get-Item $outputFile).Length / 1KB, 2)) KB"
Write-Host "Total de voos: $totalVoos`n"

Write-Host "Por Companhia:" -ForegroundColor Cyan
foreach ($k in $companhias.Keys) {
    Write-Host "  - $k : $($companhias[$k]) voos"
}

Write-Host "`n=== ESTRUTURA DA RESPOSTA ===" -ForegroundColor Yellow
Write-Host "RequestId: $($Resp.RequestId)"
Write-Host "Success: $($Resp.Success)"
Write-Host "HasResult: $($Resp.HasResult)"
Write-Host "Completed: $($Resp.Completed)"
Write-Host "TotalItens: $($Resp.TotalItens)"

if ($Resp.Data -and $Resp.Data.Count -gt 0) {
    Write-Host "`nData[0] - Campos principais:"
    Write-Host "  - flights: $($Resp.Data[0].flights.Count) voos"
    Write-Host "  - MinPrice: R$ $($Resp.Data[0].MinPrice)"
    Write-Host "  - MaxPrice: R$ $($Resp.Data[0].MaxPrice)"
    Write-Host "  - AveragePrice: R$ $($Resp.Data[0].AveragePrice)"
    
    if ($Resp.Data[0].flights -and $Resp.Data[0].flights.Count -gt 0) {
        $primeiroVoo = $Resp.Data[0].flights[0]
        Write-Host "`nPrimeiro voo - Campos disponiveis:"
        $primeiroVoo.PSObject.Properties | ForEach-Object {
            $tipo = if($_.Value -eq $null){'null'}elseif($_.Value.GetType().IsArray){'array'}else{$_.Value.GetType().Name}
            Write-Host "  - $($_.Name): $tipo"
        }
        
        if ($primeiroVoo.segments -and $primeiroVoo.segments.Count -gt 0) {
            Write-Host "`nPrimeiro segmento - Campos disponiveis:"
            $primeiroVoo.segments[0].PSObject.Properties | ForEach-Object {
                $tipo = if($_.Value -eq $null){'null'}elseif($_.Value.GetType().IsArray){'array'}else{$_.Value.GetType().Name}
                Write-Host "  - $($_.Name): $tipo"
            }
        }
    }
}

Write-Host "`n=== ACESSE O ARQUIVO PARA VER TODOS OS DETALHES ===" -ForegroundColor Cyan
Write-Host "$outputFile" -ForegroundColor White
Write-Host "`nUse 'code $outputFile' para abrir no VS Code" -ForegroundColor Gray
