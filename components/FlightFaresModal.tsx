"use client"

import React from 'react'
import { X, Plane, Check, Luggage, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface BagagemInclusa {
  Bagagem: number
  TextoBagagem: string
  Quantidade: number
}

interface Tarifa {
  Tipo: string
  ValorAdulto: number
  ValorCrianca: number
  TaxaEmbarque: number
  Classe: string
  BagagensInclusas: BagagemInclusa[]
}

interface Voo {
  Numero: string
  Saida: string
  Chegada: string
  Origem: string
  Destino: string
  Duracao: number
  Tempo: string
}

interface FlightData {
  Token: string
  Cia: {
    Nome: string
    Iata: string
  }
  Voos: Voo[]
  Tarifas: Tarifa[]
  ValorAdulto: number
  ValorTotalComTaxa: number
  ValorTotalTaxas?: number
  Taxas?: {
    Embarque: number
    Servico: number
  }
  Origem: string
  Destino: string
  Saida: string
  Chegada: string
  TempoTotalStr: string
  FlightCode?: string
  RexturFlightGroup?: string
  // Outros voos do mesmo grupo (outras tarifas)
  relatedFlights?: FlightData[]
}

interface FlightFaresModalProps {
  isOpen: boolean
  onClose: () => void
  flightData: FlightData
  allFlights?: FlightData[] // Lista completa de voos para encontrar outras tarifas
  onSelect?: (args: { tarifa: { Tipo: string; ValorTotalComTaxa: number }, flight: FlightData }) => void
}

// Configurações das companhias aéreas
const airlineConfig = {
  'Latam': {
    colors: {
      primary: '#E31E24',
      secondary: '#FF6B35',
      accent: '#FFF5F5'
    },
    logo: '/logos/latam.png'
  },
  'GOL': {
    colors: {
      primary: '#FF8C00',
      secondary: '#FFB347',
      accent: '#FFF8F0'
    },
    logo: '/logos/gol.png'
  },
  'Azul': {
    colors: {
      primary: '#003366',
      secondary: '#0066CC',
      accent: '#E6F2FF'
    },
    logo: '/logos/azul.png'
  }
}

// Mapear tipos de tarifa para nomes em português
const fareTypeNames = {
  'LIGHT': 'Econômica Light',
  'STANDARD': 'Econômica',
  'FULL': 'Flex',
  'PREMIUM ECONOMY': 'Premium Economy'
}

// Ícones para diferentes tipos de bagagem
const getBagageIcon = (tipo: number) => {
  switch (tipo) {
    case 0:
      return <ShoppingBag className="h-4 w-4" />
    case 1:
      return <Luggage className="h-4 w-4" />
    default:
      return <Luggage className="h-4 w-4" />
  }
}

export default function FlightFaresModal({ isOpen, onClose, flightData, allFlights = [], onSelect }: FlightFaresModalProps) {
  if (!isOpen) return null

  const airlineName = flightData.Cia.Nome
  const config = airlineConfig[airlineName as keyof typeof airlineConfig] || airlineConfig['Latam']
  
  // Detectar se é voo em milhas
  const isMilesFlight = (flightData as any).PontosAdulto > 0
  const milesAmount = (flightData as any).PontosAdulto || 0
  
  console.log('🚀 FlightFaresModal: Iniciando modal de tarifas')
  console.log('✈️ É voo em milhas?', isMilesFlight, '- Milhas:', milesAmount)
  console.log('🔍 MODAL DEBUG - Estrutura completa dos dados do voo:')
  console.log('   flightData:', flightData)
  console.log('   flightData.PontosAdulto:', (flightData as any).PontosAdulto)
  console.log('   typeof PontosAdulto:', typeof (flightData as any).PontosAdulto)
  console.log('   ValorTotalComTaxa:', flightData.ValorTotalComTaxa)
  console.log('   Todas as chaves:', Object.keys(flightData))
  console.log('📊 Voo atual:', {
    token: flightData.Token,
    flightNumber: flightData.Voos[0]?.Numero,
    route: `${flightData.Origem}-${flightData.Destino}`,
    currentPrice: flightData.ValorTotalComTaxa,
    fareType: flightData.Tarifas[0]?.Tipo,
    allFlightsCount: allFlights.length,
    pontosAdulto: milesAmount,
    isMilesFlight: isMilesFlight
  })

  // Se for voo em milhas, mostrar apenas uma tarifa padrão em milhas
  // Em vez de buscar várias classes na API (que retorna preços em dinheiro)
  if (isMilesFlight) {
    console.log('🎯 VOO EM MILHAS: Criando tarifa única com', milesAmount, 'milhas')
    
    const milesFare = {
      Tipo: 'MILES',
      ValorAdulto: milesAmount,
      ValorTotalComTaxa: milesAmount, // Em milhas, não em reais
      BagagensInclusas: flightData.Tarifas[0]?.BagagensInclusas || [],
      Token: flightData.Token,
      isFromAPI: true,
      source: 'miles-flight',
      isMiles: true
    }
    
    const formatMiles = (value: number) => {
      return new Intl.NumberFormat('pt-BR').format(value) + ' milhas'
    }
    
    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div 
            className="relative p-6 text-white"
            style={{ backgroundColor: config.colors.primary }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-lg p-2">
                  <Plane className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{airlineName}</h2>
                  <p className="text-white/90">
                    {flightData.Origem} → {flightData.Destino}
                  </p>
                  <p className="text-white/70 text-sm">
                    ✈️ Voo em milhas
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Flight Info */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{formatTime(flightData.Saida)}</span>
              <span className="flex items-center space-x-2">
                <span>{flightData.TempoTotalStr}</span>
                {flightData.Voos.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {flightData.Voos.length - 1} parada{flightData.Voos.length > 2 ? 's' : ''}
                  </Badge>
                )}
              </span>
              <span>{formatTime(flightData.Chegada)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-semibold">{flightData.Origem}</span>
              <div className="flex-1 mx-4 relative">
                <div 
                  className="h-1 rounded-full"
                  style={{ backgroundColor: config.colors.secondary }}
                ></div>
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: config.colors.primary }}
                ></div>
              </div>
              <span className="font-semibold">{flightData.Destino}</span>
            </div>
          </div>

          {/* Tarifa em Milhas */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-6">Voo disponível por milhas</h3>
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-blue-500 bg-blue-50 shadow-lg">
                <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white bg-blue-600">
                  RESGATE DE MILHAS
                </div>
                
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-lg mb-1 text-blue-900">
                      ✈️ Tarifa Milhas
                    </h4>
                    <div className="text-3xl font-bold text-blue-700">
                      {formatMiles(milesAmount)}
                    </div>
                    <div className="text-xs text-gray-600">por pessoa</div>
                    <div className="text-xs text-blue-600 mt-1">+ taxas em dinheiro</div>
                  </div>

                  {/* Bagagens incluídas */}
                  <div className="space-y-2 mb-4">
                    <h5 className="font-semibold text-sm text-gray-700 flex items-center">
                      <Luggage className="h-4 w-4 mr-1" />
                      Bagagens incluídas:
                    </h5>
                    {milesFare.BagagensInclusas.map((bagagem, bagIndex) => (
                      <div key={bagIndex} className="flex items-start space-x-2 text-xs">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex items-center space-x-1">
                          {getBagageIcon(bagagem.Bagagem)}
                          <span className="text-gray-600">
                            {bagagem.TextoBagagem}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full font-semibold"
                      size="lg"
                      style={{ 
                        backgroundColor: config.colors.primary,
                        borderColor: config.colors.primary
                      }}
                    >
                      <Plane className="h-4 w-4 mr-2" />
                      Resgatar com Milhas
                    </Button>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-700">
                        {formatMiles(milesAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Resgate disponível no programa de fidelidade
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Aviso informativo */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-amber-600 mt-0.5">
                  ℹ️
                </div>
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Como resgatar este voo:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Faça login no programa de fidelidade da {airlineName}</li>
                    <li>Procure por voos de resgate na mesma rota e horário</li>
                    <li>O valor pode variar conforme disponibilidade</li>
                    <li>Taxas aeroportuárias serão cobradas em dinheiro</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="px-6 py-4 text-center text-sm"
            style={{ backgroundColor: config.colors.accent }}
          >
            <p className="text-gray-600">
              * Disponibilidade sujeita a confirmação no programa de fidelidade. Taxas em dinheiro podem ser aplicadas.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  // Na API Moblix, cada CLASSE é um VOO SEPARADO com token próprio!
  // Buscar todas as classes do mesmo voo (mesmo número, rota, horário)
  const mainFlightNumber = flightData.Voos[0]?.Numero
  const mainRoute = `${flightData.Origem}-${flightData.Destino}`
  const mainDeparture = flightData.Saida
  
  // Incluir o voo atual + voos relacionados (outras classes)
  const allFlightVariants = [flightData, ...allFlights.filter(flight => 
    flight.Voos[0]?.Numero === mainFlightNumber &&
    `${flight.Origem}-${flight.Destino}` === mainRoute &&
    flight.Saida === mainDeparture &&
    flight.Token !== flightData.Token
  )]
  
  // FILTRAR APENAS OS PREÇOS MAIS ALTOS (a API retorna duas faixas de preço)
  // Encontrar o maior preço por tipo de tarifa
  const highestPricesByType: Record<string, { flight: FlightData; preco: number }> = {}
  allFlightVariants.forEach((flight: FlightData) => {
    const tipoTarifa = flight.Tarifas[0]?.Tipo || 'UNKNOWN'
    const preco = flight.ValorTotalComTaxa
    if (!highestPricesByType[tipoTarifa] || preco > highestPricesByType[tipoTarifa].preco) {
      highestPricesByType[tipoTarifa] = { flight, preco }
    }
  })
  
  // Usar apenas os voos com preços mais altos
  const filteredFlightVariants = Object.values(highestPricesByType).map((item) => (item as { flight: FlightData }).flight)
  
  console.log(`🔍 Encontrados ${allFlightVariants.length} variantes do voo total`)
  console.log(`✅ Filtrados ${filteredFlightVariants.length} voos com preços mais altos:`)
  filteredFlightVariants.forEach((flight, index) => {
    console.log(`  ${index + 1}. ${flight.Tarifas[0]?.Tipo}: R$ ${flight.ValorTotalComTaxa.toFixed(2)}`)
  })

  // Criar array de tarifas com preços corretos da API MOBLIX (100% ORIGINAIS)
  const allFares = filteredFlightVariants.map(flight => {
    const tarifa = flight.Tarifas[0] // Cada voo tem 1 tarifa específica
    
    // 🎯 CRÍTICO: Usar SEMPRE o ValorTotalComTaxa do FLIGHT (não da tarifa)
    // Este valor já inclui voo + tarifas + taxas conforme a API Moblix
    const precoTotalAPI = flight.ValorTotalComTaxa || 0
    
    console.log(`💰 MODAL - ${tarifa.Tipo}: R$ ${precoTotalAPI.toFixed(2)} (100% API Moblix)`)
    console.log(`📊 MODAL - Fonte: flight.ValorTotalComTaxa (voo + tarifas + taxas)`)
    
    return {
      Tipo: tarifa.Tipo,
      ValorAdulto: tarifa.ValorAdulto,
      ValorTotalComTaxa: precoTotalAPI, // 100% VALOR ORIGINAL DA API MOBLIX
      BagagensInclusas: tarifa.BagagensInclusas,
      Token: flight.Token,
      isFromAPI: true,
      source: flight.Token === flightData.Token ? 'current-flight' : 'related-flight',
      originalFlightData: {
        ValorTotalComTaxa: flight.ValorTotalComTaxa,
        ValorAdulto: flight.ValorAdulto
      }
    }
  })

  // Garantir que temos pelo menos a tarifa atual se não há outras classes
  let finalFares = allFares
  
  if (finalFares.length === 1) {
    // Se só tem uma classe, buscar se há outras classes disponíveis
    // Se não, mostrar apenas esta classe
    console.log('⚠️ Apenas uma classe disponível:', finalFares[0].Tipo)
  }
  
  console.log('✅ Tarifas finais calculadas:', {
    totalFares: finalFares.length,
    fares: finalFares.map(f => ({ 
      tipo: f.Tipo, 
      preco: f.ValorTotalComTaxa,
      source: f.source
    }))
  })
  
  // Ordenar do menor para o maior preço
  const sortedFares = finalFares.sort((a, b) => a.ValorTotalComTaxa - b.ValorTotalComTaxa)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div 
          className="relative p-6 text-white"
          style={{ backgroundColor: config.colors.primary }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{airlineName}</h2>
                <p className="text-white/90">
                  {flightData.Origem} → {flightData.Destino}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Flight Info */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{formatTime(flightData.Saida)}</span>
            <span className="flex items-center space-x-2">
              <span>{flightData.TempoTotalStr}</span>
              {flightData.Voos.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  {flightData.Voos.length - 1} parada{flightData.Voos.length > 2 ? 's' : ''}
                </Badge>
              )}
            </span>
            <span>{formatTime(flightData.Chegada)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-semibold">{flightData.Origem}</span>
            <div className="flex-1 mx-4 relative">
              <div 
                className="h-1 rounded-full"
                style={{ backgroundColor: config.colors.secondary }}
              ></div>
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: config.colors.primary }}
              ></div>
            </div>
            <span className="font-semibold">{flightData.Destino}</span>
          </div>

          {flightData.Voos.map((voo, index) => (
            <div key={index} className="mt-2 text-xs text-gray-500">
              {voo.Numero} • {voo.Tempo}
              {index < flightData.Voos.length - 1 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-gray-600">
                  Conexão
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Tarifas */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6">Escolha sua tarifa</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedFares.map((tarifa, index) => (
              <Card 
                key={tarifa.Tipo}
                className={`relative overflow-hidden border-2 hover:shadow-lg transition-all cursor-pointer ${
                  index === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {index === 1 && (
                  <div 
                    className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    RECOMENDADO
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-lg mb-1">
                      {fareTypeNames[tarifa.Tipo as keyof typeof fareTypeNames] || tarifa.Tipo}
                    </h4>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: config.colors.primary }}
                    >
                      {formatCurrency(tarifa.ValorTotalComTaxa)}
                    </div>
                    <div className="text-xs text-gray-500">por pessoa</div>
                  </div>

                  {/* Bagagens incluídas */}
                  <div className="space-y-2 mb-4">
                    <h5 className="font-semibold text-sm text-gray-700 flex items-center">
                      <Luggage className="h-4 w-4 mr-1" />
                      Bagagens incluídas:
                    </h5>
                    {tarifa.BagagensInclusas.map((bagagem: BagagemInclusa, bagIndex: number) => (
                      <div key={bagIndex} className="flex items-start space-x-2 text-xs">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex items-center space-x-1">
                          {getBagageIcon(bagagem.Bagagem)}
                          <span className="text-gray-600">
                            {bagagem.TextoBagagem}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full font-semibold"
                      size="lg"
                      style={{ 
                        backgroundColor: config.colors.primary,
                        borderColor: config.colors.primary
                      }}
                      onClick={() => {
                        if (onSelect) {
                          onSelect({ tarifa: { Tipo: tarifa.Tipo, ValorTotalComTaxa: tarifa.ValorTotalComTaxa }, flight: flightData })
                        }
                        onClose()
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = config.colors.secondary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = config.colors.primary
                      }}
                    >
                      Selecionar Tarifa
                    </Button>
                    <div className="text-xs text-center text-gray-500">
                      {formatCurrency(tarifa.ValorTotalComTaxa)} total
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 text-center text-sm"
          style={{ backgroundColor: config.colors.accent }}
        >
          <p className="text-gray-600">
            * Preços sujeitos a alteração. Taxas de embarque e bagagens extras não incluídas.
          </p>
        </div>
      </div>
    </div>
  )
}
