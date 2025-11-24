param(
  [Parameter(Mandatory=$true)][string]$Origem,
  [Parameter(Mandatory=$true)][string]$Destino,
  [Parameter(Mandatory=$true)][string]$Ida,
  [string]$Volta = '',
  [int]$Adultos = 1,
  [int]$Criancas = 0,
  [int]$Bebes = 0,
  [int]$Companhia = -1,
  [string]$Base = 'https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/aereo'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Write-JsonError {
  param([string]$Message)
  [pscustomobject]@{ error = $Message } | ConvertTo-Json -Compress | Write-Output
}

try {
  # 1) Token
  $tokenResp = Invoke-RestMethod -Method Post -Uri "$Base/api/Token" -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&username=TooGood&password=23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7"
  $token = $tokenResp.access_token
  if (-not $token) { throw "Falha ao obter token de acesso" }

  $Headers = @{ Accept = 'application/json'; 'Content-Type' = 'application/json'; Authorization = "Bearer $token" }

  # 2) Parâmetros
  $BodyObj = @{ Origem=$Origem; Destino=$Destino; Ida=$Ida; Adultos=$Adultos; Criancas=$Criancas; Bebes=$Bebes; Classe=0; Companhia=$Companhia }
  if ($Volta -and $Volta.Trim().Length -gt 0) { $BodyObj.Volta = $Volta }
  $BodyJson = $BodyObj | ConvertTo-Json -Compress

  # 3) Consulta consolidada
  $Resp = Invoke-RestMethod -Method Post -Uri "$Base/api/ConsultaAereo/Consultar" -Headers $Headers -Body $BodyJson -TimeoutSec 120

  # 4) Função auxiliar para checar propriedades
  function Get-NoteProp {
    param($obj, [string]$name)
    if ($null -ne $obj -and ($obj | Get-Member -Name $name -MemberType NoteProperty)) { return $obj.$name }
    return $null
  }

  # 5) Resumo
  $groups = 0; $idaCount = 0; $voltaCount = 0; $byCia = @{}
  $data = Get-NoteProp $Resp 'Data'
  if ($data) {
    $groups = ($data | Measure-Object).Count
    foreach ($g in $data) {
      $idas = Get-NoteProp $g 'Ida'
      if ($idas) {
        $idaCount += ($idas | Measure-Object).Count
        foreach ($f in $idas) {
          $ciaName = $null
          if ($f.Cia -and $f.Cia.Nome) { $ciaName = $f.Cia.Nome }
          elseif ($f.CompanhiaAerea)   { $ciaName = $f.CompanhiaAerea }
          if ($ciaName) {
            if ($byCia.ContainsKey($ciaName)) { $byCia[$ciaName] = [int]$byCia[$ciaName] + 1 }
            else { $byCia[$ciaName] = 1 }
          }
        }
      }
      $voltas = Get-NoteProp $g 'Volta'
      if ($voltas) { $voltaCount += ($voltas | Measure-Object).Count }
    }
  }

  $companyArr = @()
  foreach ($k in $byCia.Keys) { $companyArr += [pscustomobject]@{ companhia = $k; voos = $byCia[$k] } }

  # 6) Amostra (5 voos de ida)
  $sample = @()
  if ($data -and $data.Count -gt 0) {
    $idas0 = Get-NoteProp $data[0] 'Ida'
    if ($idas0) {
      $i = 0
      foreach ($f in $idas0) {
        $i++; if ($i -gt 5) { break }
        $cia = $null
        if ($f.Cia -and $f.Cia.Nome) { $cia = $f.Cia.Nome } elseif ($f.CompanhiaAerea) { $cia = $f.CompanhiaAerea }
        $price = $null
        if ($f.ValorTotalComTaxa) { $price = $f.ValorTotalComTaxa }
        elseif ($f.ValorTotal) { $price = $f.ValorTotal }
        elseif ($f.priceWithTax) { $price = $f.priceWithTax }
        $sample += [pscustomobject]@{ cia=$cia; voo=$f.FlightCode; origem=$f.Origem; destino=$f.Destino; saida=$f.Saida; chegada=$f.Chegada; preco=$price }
      }
    }
  }

  $summary = [pscustomobject]@{
    Origem=$Origem; Destino=$Destino; Ida=$Ida; Volta=$Volta; Companhia=$Companhia;
    Grupos=$groups; VoosIda=$idaCount; VoosVolta=$voltaCount; PorCompanhia=$companyArr; Amostra=$sample
  }

  $summary | ConvertTo-Json -Depth 8 -Compress | Write-Output
}
catch {
  Write-JsonError -Message ("Falha: " + $_.Exception.Message)
}
