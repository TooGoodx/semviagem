"use client"

import React, { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import FlightCard from './FlightCard'
import SearchFilters from './SearchFilters'
import TravelProgress from './TravelProgress'
import SimplifiedLoadingBar from './SimplifiedLoadingBar'
import { addFaresToCache, generateFlightKey, cleanOldCache } from './utils/fareCache'
import { useTravelContext } from '@/contexts/TravelContext'
import ReturnFlightsModal from './ReturnFlightsModal'

interface BagagemInclusa {
  Bagagem: number
  TextoBagagem: string
  Quantidade: number
}

interface Tarifa {
  SegmentClass: string | null
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
  Classe: number
  ClasseStr: string
}

interface FlightData {
  Token: string
  IdCia: number
  CiaParceira: any
  Cia: {
    Ids: any
    Id: number
    Nome: string
    Iata: string
    AtivaBusca: any
    Icao: any
    Pais: any
  }
  PontosAdulto: number
  PontosCrianca: number
  QntdBagagem: number
  QtdBagagemInclusa: number
  Voos: Voo[]
  ConfiguracoesRotas: string
  Tarifas: Tarifa[]
  ValorAdulto: number
  ValorAdultoStr: any
  ValorAdultoSemCalc: number
  ValorAdultoNaCia: number
  ValorCrianca: number
  ValorBebe: number
  ValorTotal: number
  ValorTotalComTaxa: number
  ValorTotalTaxas: number
  FareOriginType: any
  Origem: string
  Destino: string
  Saida: string
  Chegada: string
  Duracao: number
  TempoTotalStr: string
  ValorTxServico: number
  PercentualEconomia: number
  FlightCode: string
  Periodo: number
  Adultos: number
  Criancas: number
  BagagensInclusas: BagagemInclusa[]
  Site: any
  Nome: any
  UrlPesquisa: any
  Classe: number
  JourneyKey: any
  fareAvailabilityKey: any
  RexturFlightGroup: string
  FlightReturn: any
  IdViagem: any
  IdsViagensVolta: any
  KeyIdViagensVolta: string
}

interface ApiResponse {
  RequestId: any
  Success: boolean
  HasResult: boolean
  ExErro: any
  Data: Array<{
    TokenConsulta: string
    QntdAdulto: number
    QntdCrianca: number
    QntdBebe: number
    Ida: FlightData[]
    Volta: any[]
    Companhia: string
    CompanhiaVolta: any
    Aeroportos: any[]
    Request: any
    IsStarAlliance: boolean
    LogErros: any[]
    PesquisaMilhasHabilitada: boolean
    PesquisaPaganteHabilitada: boolean
    SemDisponibilidade: boolean
    ByCache: boolean
    ErroConsulta: any
  }>
  Completed: boolean
  TotalItens: number
}

// Interface para filtros
interface SearchFilters {
  passengers: {
    adults: number
    children: number
    babies: number
  }
  paymentType: 'money' | 'miles' | 'both'
  sortBy: 'price' | 'duration' | 'departure' | 'arrival'
  tripType: 'roundtrip' | 'oneway'
  airline: string
  stops: string
}

export default function FlightResults() {
  const {
    searchData,
    setSearchData,
    selectedOutbound,
    selectedReturn,
    setSelectedOutbound,
    currentStep,
    setCurrentStep,
    isRoundTrip,
    needsReturnFlight,
    getReverseRoute
  } = useTravelContext()
  
  const [flights, setFlights] = useState<FlightData[]>([])
  const [returnFlights, setReturnFlights] = useState<FlightData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReturn, setLoadingReturn] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    passengers: { adults: 1, children: 0, babies: 0 },
    paymentType: 'both',
    sortBy: 'price',
    tripType: 'oneway',
    airline: 'all',
    stops: 'all'
  })

  useEffect(() => {
    const loadFlights = async () => {
      try {
        console.log('🛫 Consultando API Moblix com parâmetros do usuário (ida e volta juntos quando disponível)')
        const payload: any = {
          Origem: (searchData as any)?.origem || 'GRU',
          Destino: (searchData as any)?.destino || 'BSB',
          DataIda: (searchData as any)?.dataIda || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
          DataVolta: (searchData as any)?.dataVolta || null,
          Adultos: (searchData as any)?.adultos || 1,
          Criancas: (searchData as any)?.criancas || 0,
          Bebes: (searchData as any)?.bebes || 0,
          Companhia: 1,
          Classe: 0,
          TipoViagem: (searchData as any)?.dataVolta ? 'IDA_VOLTA' : 'IDA'
        }

        if (payload.DataVolta) {
          console.log(`🚀 ESTRATÉGIA UNIFICADA: buscando ida e volta juntas (${payload.Origem}→${payload.Destino}) em ${payload.DataIda} e volta em ${payload.DataVolta}`)
        } else {
          console.log(`🚀 ESTRATÉGIA UNIFICADA: buscando somente ida (${payload.Origem}→${payload.Destino}) em ${payload.DataIda}`)
        }

        const apiResponse = await fetch('/.netlify/functions/aereo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Origin': 'externo' },
          body: JSON.stringify({
            path: '/api/ConsultaAereo/Consultar',
            method: 'POST',
            body: JSON.stringify(payload)
          })
        })

        if (apiResponse.ok) {
          const apiData: ApiResponse = await apiResponse.json()
          const ida = apiData?.Data?.[0]?.Ida || []
          const volta = apiData?.Data?.[0]?.Volta || []

          if (payload.DataVolta) {
            console.log(`✅ ESTRATÉGIA UNIFICADA: resultados carregados (ida=${ida.length}, volta=${volta.length})`)
          } else {
            console.log(`✅ ESTRATÉGIA UNIFICADA: resultados carregados (ida=${ida.length})`)
          }

          // Alimentar cache com ida
          ida.forEach(flight => {
            if (flight.Voos[0]?.Numero && flight.Tarifas.length > 0) {
              const flightKey = {
                flightNumber: flight.Voos[0].Numero,
                route: `${flight.Origem}-${flight.Destino}`,
                departure: flight.Saida
              }
              const cachedFares = flight.Tarifas.map(tarifa => ({
                Tipo: tarifa.Tipo,
                ValorAdulto: tarifa.ValorAdulto,
                ValorTotalComTaxa: flight.ValorTotalComTaxa,
                BagagensInclusas: tarifa.BagagensInclusas,
                timestamp: Date.now()
              }))
              addFaresToCache(flightKey, cachedFares)
            }
          })

          // Limpar cache antigo (30 minutos)
          cleanOldCache(30)

          setFlights(ida)
          setReturnFlights(volta)
          console.log(`✅ Voos carregados: ida=${ida.length}, volta=${volta.length}`)
        } else {
          console.error(`❌ Erro API Moblix: ${apiResponse.status} ${apiResponse.statusText}`)
          setFlights([])
          setReturnFlights([])
        }
      } catch (error) {
        console.error('❌ Erro ao consultar API Moblix:', error)
        setFlights([])
        setReturnFlights([])
      } finally {
        setLoading(false)
      }
    }

    loadFlights()
  }, [searchData])

  // Ouvir seleção de ida disparada globalmente pelos cards (src/.../FlightResultCard)
  useEffect(() => {
    const onChooseOutbound = (e: Event) => {
      const detail = (e as CustomEvent).detail as { flight?: any }
      if (!detail?.flight) return
      try {
        setSelectedOutbound({ flightData: detail.flight, tipo: 'IDA' } as any)
        setCurrentStep('SELECT_RETURN')
      } catch (err) {
        console.warn('Falha ao avançar para seleção de volta via evento global:', err)
      }
    }
    try {
      window.addEventListener('sv-choose-outbound', onChooseOutbound as EventListener)
    } catch {}
    return () => {
      try {
        window.removeEventListener('sv-choose-outbound', onChooseOutbound as EventListener)
      } catch {}
    }
  }, [setSelectedOutbound, setCurrentStep])

  // Quando avançar para a etapa de selecionar VOLTA, abrir o modal
  useEffect(() => {
    if (currentStep === 'SELECT_RETURN') {
      // Se já temos voos de volta carregados, apenas abre o modal
      if (returnFlights && returnFlights.length > 0) {
        setIsReturnModalOpen(true)
      } else {
        // fallback: nada carregado, manter comportamento antigo (busca rápida de volta)
        setIsReturnModalOpen(true)
      }
    } else {
      setIsReturnModalOpen(false)
    }
  }, [currentStep, returnFlights])

  // Função para lidar com mudanças de filtros
  const handleFiltersChange = (newFilters: SearchFilters) => {
    console.log('🔄 Filtros atualizados:', newFilters)
    setFilters(newFilters)
    
    // Se mudou o número de passageiros ou tipo de viagem, fazer nova consulta
    if (newFilters.passengers !== filters.passengers || newFilters.tripType !== filters.tripType) {
      console.log('🔄 Fazendo nova consulta devido a mudança de passageiros/tipo de viagem')
      // Aqui poderia fazer nova consulta na API com os novos parâmetros
    }
  }

  // Função para nova busca
  const handleNewSearch = () => {
    console.log('🔍 Iniciando nova busca')
    // Esta função será chamada pelo componente SearchFilters
  }

  // Filtros aplicados
  const filteredFlights = flights.filter(flight => {
    // Filtro de companhia
    if (filters.airline !== 'all' && flight.Cia.Nome !== filters.airline) {
      return false
    }
    
    // Filtro de paradas
    if (filters.stops !== 'all') {
      const isDirectFlight = flight.Voos.length === 1
      if (filters.stops === 'direct' && !isDirectFlight) return false
      if (filters.stops === 'stops' && isDirectFlight) return false
    }
    
    // Filtro de tipo de pagamento
    if (filters.paymentType !== 'both') {
      const hasPoints = flight.PontosAdulto && flight.PontosAdulto > 0
      const hasPrice = (flight.ValorTotalComTaxa || flight.ValorAdulto) > 0
      
      if (filters.paymentType === 'miles' && !hasPoints) return false
      if (filters.paymentType === 'money' && !hasPrice) return false
    }
    
    return true
  })

  // Ordenação
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price':
        const priceA = a.ValorTotalComTaxa || a.ValorAdulto || 0
        const priceB = b.ValorTotalComTaxa || b.ValorAdulto || 0
        return priceA - priceB
      case 'duration':
        return (a.Duracao || 0) - (b.Duracao || 0)
      case 'departure':
        return new Date(a.Saida).getTime() - new Date(b.Saida).getTime()
      case 'arrival':
        return new Date(a.Chegada).getTime() - new Date(b.Chegada).getTime()
      default:
        return 0
    }
  })

  // Esta linha será removida pois agora as companhias são obtidas no componente SearchFilters

  if (loading) {
    return (
      <div className="min-h-64">
        <SimplifiedLoadingBar isLoading={true} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Indicador de progresso da jornada */}
      <TravelProgress className="mb-6" />
      
      {/* Exibir filtros apenas enquanto estiver selecionando IDA */}
      {currentStep !== 'SELECT_RETURN' && (
        <SearchFilters 
          onFiltersChange={handleFiltersChange}
          onNewSearch={handleNewSearch}
          flights={flights}
          loading={loading}
        />
      )}

      {/* Lista de voos de IDA: oculta quando for selecionar VOLTA */}
      {currentStep !== 'SELECT_RETURN' && (
        <div className="space-y-4">
          {sortedFlights.length > 0 ? (
            sortedFlights.map((flight) => (
              <FlightCard key={flight.Token} flightData={flight} allFlights={flights} />
            ))
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                {flights.length === 0 ? (
                  <div className="space-y-4">
                    <div className="text-6xl">✈️</div>
                    <h3 className="text-xl font-semibold text-gray-700">Consultando voos disponíveis</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Esta aplicação exibe APENAS dados verdadeiros da API Moblix. 
                      Não são mostrados dados falsos ou mockados.
                    </p>
                    <p className="text-sm text-gray-400">
                      Aguarde enquanto consultamos a API real para obter preços e voos autênticos de todas as companhias aéreas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500">Nenhum voo encontrado com os filtros selecionados.</p>
                    <Button 
                      onClick={() => {
                        const defaultFilters: SearchFilters = {
                          passengers: { adults: 1, children: 0, babies: 0 },
                          paymentType: 'both',
                          sortBy: 'price',
                          tripType: 'oneway',
                          airline: 'all',
                          stops: 'all'
                        }
                        setFilters(defaultFilters)
                      }}
                      className="mt-4"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal de seleção de voos da VOLTA */}
      <ReturnFlightsModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        flights={returnFlights}
      />
    </div>
  )
}
