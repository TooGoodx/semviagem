$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Obtendo Token ===" -ForegroundColor Cyan
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host "Token: OK`n" -ForegroundColor Green

$Headers = @{ Accept = 'application/json'; 'Content-Type' = 'application/json'; Authorization = "Bearer $token" }

# Testes de rotas
$testes = @(
    @{ Origem='CGH'; Destino='CNF'; Ida='2025-10-31'; Desc='CGH->CNF (original)' },
    @{ Origem='GRU'; Destino='GIG'; Ida='2025-10-15'; Desc='GRU->GIG (comum)' },
    @{ Origem='GRU'; Destino='BSB'; Ida='2025-10-15'; Desc='GRU->BSB (comum)' },
    @{ Origem='CGH'; Destino='GIG'; Ida='2025-10-15'; Desc='CGH->GIG' },
    @{ Origem='CGH'; Destino='BSB'; Ida='2025-10-15'; Desc='CGH->BSB' }
)

foreach ($teste in $testes) {
    Write-Host "Testando: $($teste.Desc)..." -NoNewline
    
    $Body = @{
        Origem = $teste.Origem
        Destino = $teste.Destino
        Ida = $teste.Ida
        Adultos = 1
        Criancas = 0
        Bebes = 0
        Classe = 0
        Companhia = -1
    } | ConvertTo-Json -Compress
    
    try {
        $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 90
        
        $idaCount = 0
        if ($Resp.Data) {
            foreach ($g in $Resp.Data) {
                if ($g.Ida) { $idaCount += ($g.Ida | Measure-Object).Count }
            }
        }
        
        if ($idaCount -gt 0) {
            Write-Host " OK - $idaCount voos encontrados" -ForegroundColor Green
        } else {
            Write-Host " 0 voos" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Diagnóstico Concluído ===" -ForegroundColor Cyan
