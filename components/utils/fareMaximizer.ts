// Função para garantir que sempre temos as tarifas mais altas da API Moblix
// Resolve o problema de tarifas incompletas na primeira abertura do modal

import { getMaxFares, generateFlightKey, debugCache } from './fareCache'

interface FlightData {
  Token: string
  Cia: {
    Nome: string
    Iata: string
  }
  Voos: Array<{
    Numero: string
    Saida: string
    Chegada: string
    Origem: string
    Destino: string
    Duracao: number
    Tempo: string
  }>
  Tarifas: Array<{
    Tipo: string
    ValorAdulto: number
    ValorCrianca: number
    TaxaEmbarque: number
    Classe: string
    BagagensInclusas: any[]
  }>
  ValorAdulto: number
  ValorTotalComTaxa: number
  Origem: string
  Destino: string
  Saida: string
  Chegada: string
  TempoTotalStr: string
}

interface MaximizedFare {
  Tipo: string
  ValorAdulto: number
  ValorTotalComTaxa: number
  BagagensInclusas: any[]
  isFromCache?: boolean
  source?: string
}

/**
 * Função principal que sempre retorna as tarifas máximas para um voo
 * Combina dados do voo atual, voos relacionados e cache para garantir valores consistentes
 */
export const getMaximizedFares = (
  flightData: FlightData,
  allFlights: FlightData[] = []
): MaximizedFare[] => {
  
  console.log('🎯 INÍCIO getMaximizedFares para voo:', {
    token: flightData.Token,
    flightNumber: flightData.Voos[0]?.Numero,
    route: `${flightData.Origem}-${flightData.Destino}`,
    departure: flightData.Saida,
    totalFlightsAvailable: allFlights.length
  })

  // Dados básicos do voo
  const mainFlightNumber = flightData.Voos[0]?.Numero
  const mainRoute = `${flightData.Origem}-${flightData.Destino}`
  const mainDeparture = flightData.Saida

  if (!mainFlightNumber || !mainRoute || !mainDeparture) {
    console.warn('⚠️ Dados básicos do voo incompletos, retornando tarifas do voo atual')
    return flightData.Tarifas.map(tarifa => ({
      Tipo: tarifa.Tipo,
      ValorAdulto: tarifa.ValorAdulto,
      ValorTotalComTaxa: flightData.ValorTotalComTaxa,
      BagagensInclusas: tarifa.BagagensInclusas,
      source: 'current-flight-fallback'
    }))
  }

  // Chave única para identificar este voo
  const flightKey = {
    flightNumber: mainFlightNumber,
    route: mainRoute,
    departure: mainDeparture
  }

  console.log('🔍 Procurando voos relacionados na lista allFlights...')
  
  // Buscar voos relacionados (mesmo voo, diferentes tarifas)
  const relatedFlights = allFlights.filter(flight => {
    const isRelated = flight.Voos[0]?.Numero === mainFlightNumber &&
      `${flight.Origem}-${flight.Destino}` === mainRoute &&
      flight.Saida === mainDeparture &&
      flight.Token !== flightData.Token

    if (isRelated) {
      console.log(`🔗 Voo relacionado encontrado: Token ${flight.Token}, Preço: ${flight.ValorTotalComTaxa}`)
    }

    return isRelated
  })

  console.log(`🔍 Encontrados ${relatedFlights.length} voos relacionados`)

  // Preparar dados dos voos relacionados para o cache
  const relatedFlightsFares = relatedFlights.map(flight => ({
    tarifas: flight.Tarifas,
    price: flight.ValorTotalComTaxa,
    token: flight.Token
  }))

  // Usar o sistema de cache para obter as tarifas máximas
  const maximizedFares = getMaxFares(
    flightData.Tarifas,
    relatedFlightsFares,
    flightKey,
    flightData.ValorTotalComTaxa
  )

  // Converter para o formato do modal
  const finalFares: MaximizedFare[] = maximizedFares.map(fare => ({
    Tipo: fare.Tipo,
    ValorAdulto: fare.ValorAdulto,
    ValorTotalComTaxa: fare.ValorTotalComTaxa,
    BagagensInclusas: fare.BagagensInclusas,
    isFromCache: true,
    source: 'maximized-cache'
  }))

  // Log de debug detalhado
  console.log('✅ RESULTADO getMaximizedFares:', {
    totalFares: finalFares.length,
    fares: finalFares.map(f => ({
      tipo: f.Tipo,
      preco: f.ValorTotalComTaxa,
      source: f.source
    })),
    flightKey: generateFlightKey(flightKey.flightNumber, flightKey.route, flightKey.departure)
  })

  // Debug do cache (opcional)
  if (process.env.NODE_ENV === 'development') {
    debugCache()
  }

  return finalFares
}

/**
 * Função utilitária para verificar se as tarifas foram maximizadas
 */
export const validateMaximizedFares = (fares: MaximizedFare[]): boolean => {
  if (fares.length === 0) {
    console.warn('⚠️ Nenhuma tarifa encontrada')
    return false
  }

  // Verificar se todas as tarifas têm preços válidos
  const validFares = fares.every(fare => 
    fare.ValorTotalComTaxa > 0 && 
    fare.Tipo && 
    fare.Tipo.trim() !== ''
  )

  if (!validFares) {
    console.warn('⚠️ Algumas tarifas têm dados inválidos:', fares)
    return false
  }

  console.log('✅ Todas as tarifas são válidas:', fares.length)
  return true
}

/**
 * Função para forçar atualização do cache quando novos dados chegam
 */
export const updateFareCache = (
  flightData: FlightData,
  newRelatedFlights: FlightData[]
): void => {
  const flightKey = {
    flightNumber: flightData.Voos[0]?.Numero || '',
    route: `${flightData.Origem}-${flightData.Destino}`,
    departure: flightData.Saida
  }

  // Reprocessar com os novos dados
  const relatedFlightsFares = newRelatedFlights.map(flight => ({
    tarifas: flight.Tarifas,
    price: flight.ValorTotalComTaxa,
    token: flight.Token
  }))

  getMaxFares(
    flightData.Tarifas,
    relatedFlightsFares,
    flightKey,
    flightData.ValorTotalComTaxa
  )

  console.log('🔄 Cache atualizado com novos dados da API Moblix')
}
