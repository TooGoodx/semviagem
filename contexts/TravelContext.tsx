"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Interface para dados de busca
interface SearchData {
  origem: string
  destino: string
  dataIda: string
  dataVolta?: string | null
  adultos: number
  criancas: number
  bebes: number
  tipoViagem: 'IDA' | 'IDA_VOLTA'
  classe: 'ECONOMICA' | 'EXECUTIVA' | 'PRIMEIRA'
  usarMilhas: boolean
}

// Interface para voo selecionado
interface SelectedFlight {
  flightData: any
  tipo: 'IDA' | 'VOLTA'
}

// Interface para contexto
interface TravelContextType {
  // Dados da busca atual
  searchData: SearchData | null
  setSearchData: (data: SearchData) => void
  
  // Voos selecionados
  selectedOutbound: SelectedFlight | null  // Voo de ida
  selectedReturn: SelectedFlight | null    // Voo de volta
  setSelectedOutbound: (flight: SelectedFlight | null) => void
  setSelectedReturn: (flight: SelectedFlight | null) => void
  
  // Estado atual da jornada
  currentStep: 'SEARCH' | 'SELECT_OUTBOUND' | 'SELECT_RETURN' | 'CONFIRMATION'
  setCurrentStep: (step: 'SEARCH' | 'SELECT_OUTBOUND' | 'SELECT_RETURN' | 'CONFIRMATION') => void
  
  // Funções utilitárias
  isRoundTrip: () => boolean
  needsReturnFlight: () => boolean
  getReverseRoute: () => { origem: string, destino: string } | null
  resetSelection: () => void
}

const TravelContext = createContext<TravelContextType | undefined>(undefined)

export const useTravelContext = () => {
  const context = useContext(TravelContext)
  if (!context) {
    throw new Error('useTravelContext must be used within a TravelProvider')
  }
  return context
}

interface TravelProviderProps {
  children: ReactNode
}

export const TravelProvider: React.FC<TravelProviderProps> = ({ children }) => {
  // Usar localStorage para persistir dados da jornada
  const [searchData, setSearchDataPersistent] = useLocalStorage<SearchData | null>('travel_search_data', null)
  const [selectedOutbound, setSelectedOutboundPersistent] = useLocalStorage<SelectedFlight | null>('travel_outbound_flight', null)
  const [selectedReturn, setSelectedReturnPersistent] = useLocalStorage<SelectedFlight | null>('travel_return_flight', null)
  const [currentStep, setCurrentStepPersistent] = useLocalStorage<'SEARCH' | 'SELECT_OUTBOUND' | 'SELECT_RETURN' | 'CONFIRMATION'>('travel_current_step', 'SELECT_OUTBOUND')
  
  // Wrappers para compatibilidade com a interface existente
  const setSearchData = (data: SearchData) => {
    setSearchDataPersistent(data)
  }
  
  const setSelectedOutbound = (flight: SelectedFlight | null) => {
    setSelectedOutboundPersistent(flight)
  }
  
  const setSelectedReturn = (flight: SelectedFlight | null) => {
    setSelectedReturnPersistent(flight)
  }
  
  const setCurrentStep = (step: 'SEARCH' | 'SELECT_OUTBOUND' | 'SELECT_RETURN' | 'CONFIRMATION') => {
    setCurrentStepPersistent(step)
  }

  // Verifica se é viagem de ida e volta
  const isRoundTrip = () => {
    return searchData?.tipoViagem === 'IDA_VOLTA'
  }

  // Verifica se ainda precisa selecionar voo de volta
  const needsReturnFlight = () => {
    return isRoundTrip() && selectedOutbound && !selectedReturn
  }

  // Obtém a rota inversa para busca de volta
  const getReverseRoute = () => {
    if (!searchData) return null
    return {
      origem: searchData.destino,  // Trocar origem por destino
      destino: searchData.origem,  // Trocar destino por origem
      dataIda: searchData.dataVolta || searchData.dataIda, // Usar data da volta ou ida como referência
      adultos: searchData.adultos,
      criancas: searchData.criancas,
      bebes: searchData.bebes,
      classe: searchData.classe,
      usarMilhas: searchData.usarMilhas
    }
  }

  // Reset da seleção (remove do localStorage também)
  const resetSelection = () => {
    setSelectedOutbound(null)
    setSelectedReturn(null)
    setCurrentStep('SELECT_OUTBOUND')
  }
  
  // Limpar todos os dados da sessão
  const clearAllData = () => {
    setSearchDataPersistent(null)
    setSelectedOutbound(null)
    setSelectedReturn(null)
    setCurrentStep('SEARCH')
  }

  console.log('TravelContext State:', {
    searchData,
    selectedOutbound: selectedOutbound ? 'Selected' : 'None',
    selectedReturn: selectedReturn ? 'Selected' : 'None',
    currentStep,
    isRoundTrip: isRoundTrip(),
    needsReturn: needsReturnFlight()
  })

  return (
    <TravelContext.Provider value={{
      searchData,
      setSearchData,
      selectedOutbound,
      selectedReturn,
      setSelectedOutbound,
      setSelectedReturn,
      currentStep,
      setCurrentStep,
      isRoundTrip,
      needsReturnFlight,
      getReverseRoute,
      resetSelection
    }}>
      {children}
    </TravelContext.Provider>
  )
}
