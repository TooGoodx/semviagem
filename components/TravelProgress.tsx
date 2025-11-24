"use client"

import React from 'react'
import { Check, Plane, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTravelContext } from '@/contexts/TravelContext'

interface TravelProgressProps {
  className?: string
}

export default function TravelProgress({ className = "" }: TravelProgressProps) {
  const {
    currentStep,
    isRoundTrip,
    selectedOutbound,
    selectedReturn,
    searchData
  } = useTravelContext()

  const steps = [
    {
      id: 'SEARCH',
      title: 'Busca',
      description: 'Definir destinos e datas',
      icon: <Plane className="h-5 w-5" />
    },
    {
      id: 'SELECT_OUTBOUND',
      title: 'Voo de Ida',
      description: 'Selecionar voo de ida',
      icon: <Plane className="h-5 w-5" />
    },
    ...(isRoundTrip() ? [{
      id: 'SELECT_RETURN',
      title: 'Voo de Volta',
      description: 'Selecionar voo de volta',
      icon: <Plane className="h-5 w-5 transform rotate-180" />
    }] : []),
    {
      id: 'CONFIRMATION',
      title: 'Confirmação',
      description: 'Revisar e finalizar',
      icon: <ShoppingCart className="h-5 w-5" />
    }
  ]

  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'SEARCH':
        return searchData ? 'completed' : 'pending'
      case 'SELECT_OUTBOUND':
        if (selectedOutbound) return 'completed'
        if (currentStep === 'SELECT_OUTBOUND') return 'current'
        return 'pending'
      case 'SELECT_RETURN':
        if (selectedReturn) return 'completed'
        if (currentStep === 'SELECT_RETURN') return 'current'
        return selectedOutbound ? 'pending' : 'disabled'
      case 'CONFIRMATION':
        if (currentStep === 'CONFIRMATION') return 'current'
        if (isRoundTrip()) {
          return (selectedOutbound && selectedReturn) ? 'pending' : 'disabled'
        }
        return selectedOutbound ? 'pending' : 'disabled'
      default:
        return 'pending'
    }
  }

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500'
      case 'current':
        return 'bg-blue-500 text-white border-blue-500'
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'disabled':
        return 'bg-gray-50 text-gray-400 border-gray-100'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${getStepClasses(status)}
                  `}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {!isLast && (
                <div className="mx-4 flex-1">
                  <div 
                    className={`
                      h-0.5 transition-all duration-300
                      ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {searchData && (
              <>
                <Badge variant="outline">
                  {searchData.origem} para {searchData.destino}
                </Badge>
                <Badge variant="outline">
                  {searchData.tipoViagem === 'IDA_VOLTA' ? 'Ida e volta' : 'Somente ida'}
                </Badge>
                <Badge variant="outline">
                  {searchData.adultos + searchData.criancas + searchData.bebes} passageiro(s)
                </Badge>
              </>
            )}
          </div>
          
          <div className="text-gray-500">
            {selectedOutbound && selectedReturn && `2 voos selecionados`}
            {selectedOutbound && !selectedReturn && isRoundTrip() && `1 de 2 voos selecionados`}
            {selectedOutbound && !isRoundTrip() && `Voo selecionado`}
            {!selectedOutbound && `Nenhum voo selecionado`}
          </div>
        </div>
      </div>
    </div>
  )
}
