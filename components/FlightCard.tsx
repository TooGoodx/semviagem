"use client"

import React, { useState } from 'react'
import { Clock, MapPin, Plane, Heart, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import FlightFaresModal from './FlightFaresModal'
import CompanyRedirectModal from './CompanyRedirectModal'
import MilesGuidanceModal from '../src/components/MilesGuidanceModal'
import { useTravelContext } from '@/contexts/TravelContext'

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
  TempoEspera?: string | null
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
  Taxas?: {
    Embarque: number
    Servico: number
  }
  Origem: string
  Destino: string
  Saida: string
  Chegada: string
  TempoTotalStr: string
  Duracao: number
}

interface FlightCardProps {
  flightData: FlightData
  allFlights?: FlightData[] // Lista completa para encontrar tarifas relacionadas
}

// Configuração das companhias aéreas para cores do card
const airlineConfig = {
  'Latam': {
    colors: {
      primary: '#E31E24',
      secondary: '#FF6B35',
      light: '#FFF5F5'
    },
    logo: '/logos/latam.png'
  },
  'GOL': {
    colors: {
      primary: '#FF8C00',
      secondary: '#FFB347',
      light: '#FFF8F0'
    },
    logo: '/logos/gol.png'
  },
  'Azul': {
    colors: {
      primary: '#003366',
      secondary: '#0066CC',
      light: '#E6F2FF'
    },
    logo: '/logos/azul.png'
  }
}

export default function FlightCard({ flightData, allFlights = [] }: FlightCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showMilesGuidanceModal, setShowMilesGuidanceModal] = useState(false)
  const { currentStep, setCurrentStep, setSelectedOutbound, setSelectedReturn } = useTravelContext()
  
  const airlineName = flightData.Cia.Nome
  const config = airlineConfig[airlineName as keyof typeof airlineConfig] || airlineConfig['Latam']

  // Função para obter o preço correto que já inclui taxas
  const getCorrectPrice = () => {
    // Usar ValorTotalComTaxa que é o preço final com todas as taxas incluídas
    return flightData.ValorTotalComTaxa
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    })
  }

  const isDirectFlight = flightData.Voos.length === 1
  const hasStops = flightData.Voos.length > 1
  const stopsCount = flightData.Voos.length - 1
  
  // Detectar se é voo em milhas
  const isMilesFlight = (flightData as any).PontosAdulto > 0
  const milesAmount = (flightData as any).PontosAdulto || 0
  
  console.log('🎯 CARD DEBUG:', {
    token: flightData.Token,
    valorTotalComTaxa: flightData.ValorTotalComTaxa,
    pontosAdulto: (flightData as any).PontosAdulto,
    isMilesFlight: isMilesFlight,
    milesAmount: milesAmount
  })
  
  // Função para lidar com clique no botão da companhia
  const handleCompanyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('🚀 BOTÃO DA COMPANHIA CLICADO!')
    console.log('📊 DADOS DO VOO:', flightData)
    console.log('✈️ É voo em milhas?', isMilesFlight)
    
    // Se é voo em milhas, mostrar modal de orientação primeiro
    if (isMilesFlight) {
      console.log('✈️ Voo em milhas detectado - mostrando modal de orientação')
      setShowMilesGuidanceModal(true)
      return
    }
    
    // Se não é milhas, mostrar modal normal da companhia
    setIsCompanyModalOpen(true)
  }
  
  // Função para continuar para o site após orientação de milhas
  const handleContinueToAirlineSite = () => {
    const airlineName = flightData.Cia.Nome
    
    // URLs específicas para cada companhia (milhas)
    const airlineUrls: Record<string, string> = {
      'LATAM': 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas',
      'Latam': 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas',
      'GOL': 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas',
      'Gol': 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas',
      'Azul': 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
    }
    
    const targetUrl = airlineUrls[airlineName] || '#'
    
    // Abrir URL da companhia
    window.open(targetUrl, '_blank')
    
    // Mostrar modal normal da companhia após orientação
    setIsCompanyModalOpen(true)
    
    console.log('✅ Redirecionado para site da companhia após orientação de milhas!')
  }

  const handleCardClick = () => {
    console.log('Card clicked, opening modal')
    console.log('Flight data:', flightData)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card 
        className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Header com logo da companhia e preço */}
          <div 
            className="flex items-center justify-between p-4"
            style={{ backgroundColor: config.colors.light }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-8">
                <img src={config.logo} alt={airlineName} className="object-contain w-full h-full" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{airlineName}</div>
                <div className="text-xs text-gray-500">
                  {flightData.Voos[0]?.Numero}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div 
                className="text-2xl font-bold"
                style={{ color: config.colors.primary }}
              >
                {isMilesFlight ? formatMiles(milesAmount) : formatCurrency(getCorrectPrice())}
              </div>
              <div className="text-xs text-gray-500">
                {isMilesFlight ? 'resgate com' : 'a partir de'}
              </div>
            </div>
          </div>

          {/* Informações do voo */}
          <div className="p-4">
            {/* Horários e rota */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(flightData.Saida)}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {flightData.Origem}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(flightData.Saida)}
                </div>
              </div>

              <div className="flex-1 mx-6 text-center">
                <div className="text-sm text-gray-600 mb-2">
                  {flightData.TempoTotalStr}
                </div>
                
                <div className="relative flex items-center">
                  <div className="flex-1 h-0.5 bg-gray-300"></div>
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm mx-2"
                    style={{ backgroundColor: config.colors.primary }}
                  ></div>
                  <div className="flex-1 h-0.5 bg-gray-300"></div>
                </div>

                <div className="mt-2">
                  {isDirectFlight ? (
                    <Badge variant="secondary" className="text-xs">
                      Direto
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {stopsCount} parada{stopsCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(flightData.Chegada)}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {flightData.Destino}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(flightData.Chegada)}
                </div>
              </div>
            </div>

            {/* Detalhes dos voos (se houver conexões) */}
            {hasStops && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {flightData.Voos.map((voo, index) => (
                  <div key={index} className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">{voo.Numero}</span> • {voo.Tempo}
                    {voo.TempoEspera && (
                      <span className="ml-2 text-orange-600">
                        Conexão: {voo.TempoEspera}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bagagem inclusa */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                {flightData.Tarifas[0]?.BagagensInclusas?.map((bagagem, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{bagagem.TextoBagagem}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer com botões melhorados */}
          <div 
            className="flex items-center justify-between p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className={`text-xs px-2 py-1 rounded-full border ${
                isMilesFlight 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {isMilesFlight ? '✈️ Milhas' : '💰 Dinheiro'}
              </span>
              <span className="text-xs text-gray-500">por pessoa</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFavorite(!isFavorite)
                }}
                className="p-2 hover:bg-red-50"
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} 
                />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('🎟️ BOTÃO VER CLASSES CLICADO!')
                  console.log('📊 DADOS DO VOO:', {
                    token: flightData.Token,
                    pontosAdulto: (flightData as any).PontosAdulto,
                    isMilesFlight: isMilesFlight,
                    valorTotal: flightData.ValorTotalComTaxa
                  })
                  
                  if (isMilesFlight) {
                    console.log('✈️ VOO EM MILHAS DETECTADO - O modal FlightFaresModal deve mostrar interface de milhas')
                  } else {
                    console.log('💰 VOO EM DINHEIRO - Modal normal de classes')
                  }
                  
                  setIsModalOpen(true)
                }}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 font-medium"
              >
                🎟️ Ver Classes
              </Button>
              
              <Button
                size="sm"
                style={{
                  backgroundColor: config.colors.primary,
                  borderColor: config.colors.primary
                }}
                className="text-white hover:opacity-90 font-semibold px-4 shadow-sm"
                onClick={handleCompanyClick}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Entre no site da companhia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de tarifas */}
      <FlightFaresModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flightData={flightData}
        allFlights={allFlights}
        onSelect={({ tarifa, flight }) => {
          // Seleção sequencial: primeiro ida, depois volta
          if (currentStep === 'SELECT_OUTBOUND') {
            setSelectedOutbound({ flightData: flight, tipo: 'IDA' })
            // Fechar quaisquer outros modais abertos em outros cards
            try { window.dispatchEvent(new Event('sv-close-modals')) } catch {}
            setCurrentStep('SELECT_RETURN')
          } else {
            setSelectedReturn({ flightData: flight, tipo: 'VOLTA' })
            setCurrentStep('CONFIRMATION')
          }
        }}
      />
      
      {/* Modal de redirecionamento da companhia */}
      <CompanyRedirectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        flightData={flightData}
      />
      
      {/* Modal de Orientação para Milhas */}
      {showMilesGuidanceModal && (
        <MilesGuidanceModal
          isOpen={showMilesGuidanceModal}
          onClose={() => setShowMilesGuidanceModal(false)}
          onContinueToSite={handleContinueToAirlineSite}
          flightInfo={{
            airline: flightData.Cia.Nome,
            route: `${flightData.Origem} → ${flightData.Destino}`,
            date: new Date(flightData.Saida).toLocaleDateString('pt-BR'),
            miles: (flightData as any).PontosAdulto || 0,
            url: '#'
          }}
        />
      )}
    </>
  )
}
