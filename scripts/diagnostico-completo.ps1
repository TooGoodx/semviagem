$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host "=== DIAGNOSTICO COMPLETO - SemViagem.com ===" -ForegroundColor Cyan
Write-Host "Comparando funcoes: aereo vs moblix-api`n" -ForegroundColor Yellow

# Testar ambas as funções
$funcoes = @(
    @{ Nome='moblix-api'; URL='https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/moblix-api' },
    @{ Nome='aereo'; URL='https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo' }
)

# Rotas para testar
$rotas = @(
    @{ Origem='GRU'; Destino='GIG'; Dias=7 },
    @{ Origem='CGH'; Destino='CNF'; Dias=28 }
)

foreach ($func in $funcoes) {
    Write-Host "`n=== Testando funcao: $($func.Nome) ===" -ForegroundColor Cyan
    
    # Token
    Write-Host "Obtendo token..." -NoNewline
    try {
        $tokenResp = Invoke-RestMethod -Method Post -Uri "$($func.URL)/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
        $token = $tokenResp.access_token
        Write-Host " OK" -ForegroundColor Green
        
        $Headers = @{
            Accept = 'application/json'
            'Content-Type' = 'application/json'
            Authorization = "Bearer $token"
        }
        
        foreach ($rota in $rotas) {
            $dataIda = (Get-Date).AddDays($rota.Dias).ToString('yyyy-MM-dd')
            
            Write-Host "  Rota: $($rota.Origem)->$($rota.Destino) | Data: $dataIda | Cia: -1 ..." -NoNewline
            
            $Body = @{
                Origem = $rota.Origem
                Destino = $rota.Destino
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
                $Resp = Invoke-RestMethod -Method Post -Uri "$($func.URL)/api/ConsultaAereo/Consultar" -Headers $Headers -Body $Body -TimeoutSec 90
                
                $idaCount = 0
                if ($Resp.Data) {
                    foreach ($g in $Resp.Data) {
                        if ($g.Ida) { $idaCount += ($g.Ida | Measure-Object).Count }
                    }
                }
                
                if ($idaCount -gt 0) {
                    Write-Host " $idaCount voos" -ForegroundColor Green
                } else {
                    Write-Host " 0 voos" -ForegroundColor Gray
                }
                
            } catch {
                Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host " FALHA TOKEN: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== CONCLUSAO ===" -ForegroundColor Yellow
Write-Host "Se ambas as funcoes retornarem 0 voos, o problema pode ser:"
Write-Host "  1. API Moblix sem dados para essas rotas/datas"
Write-Host "  2. Credenciais com restricao de acesso"
Write-Host "  3. Site SemViagem.com pode estar usando cache ou outra fonte de dados"
