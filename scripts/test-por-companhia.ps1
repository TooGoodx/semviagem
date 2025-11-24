$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'

Write-Host "=== Obtendo Token ===" -ForegroundColor Cyan
$tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
$token = $tokenResp.access_token
Write-Host "Token: OK`n" -ForegroundColor Green

$Headers = @{ Accept = 'application/json'; 'Content-Type' = 'application/json'; Authorization = "Bearer $token" }

# Teste com companhias individuais
$companhias = @(
    @{ Id=1; Nome='LATAM' },
    @{ Id=2; Nome='GOL' },
    @{ Id=3; Nome='AZUL' }
)

$Origem = 'GRU'
$Destino = 'GIG'
$Ida = '2025-10-15'

foreach ($cia in $companhias) {
    Write-Host "Testando Companhia $($cia.Id) - $($cia.Nome)..." -NoNewline
    
    $Body = @{
        Origem = $Origem
        Destino = $Destino
        Ida = $Ida
        Adultos = 1
        Criancas = 0
        Bebes = 0
        Classe = 0
        Companhia = $cia.Id
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
            
            # Mostrar primeiro voo como exemplo
            if ($Resp.Data[0].Ida -and $Resp.Data[0].Ida.Count -gt 0) {
                $primeiro = $Resp.Data[0].Ida[0]
                $preco = if($primeiro.ValorTotalComTaxa){$primeiro.ValorTotalComTaxa}elseif($primeiro.ValorTotal){$primeiro.ValorTotal}else{0}
                Write-Host "  Exemplo: $($primeiro.FlightCode) - R$ $preco - $($primeiro.Saida) -> $($primeiro.Chegada)" -ForegroundColor Cyan
            }
        } else {
            Write-Host " 0 voos" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Teste Por Companhia Concluído ===" -ForegroundColor Cyan
