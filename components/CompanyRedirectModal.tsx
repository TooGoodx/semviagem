"use client"

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FlightData {
  Cia: {
    Nome: string
    Iata: string
  }
  Origem: string
  Destino: string
  Saida: string
  ValorTotalComTaxa: number
  TempoTotalStr?: string
}

interface CompanyRedirectModalProps {
  isOpen: boolean
  onClose: () => void
  flightData: FlightData
}

export default function CompanyRedirectModal({ isOpen, onClose, flightData }: CompanyRedirectModalProps) {
  if (!isOpen) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleResponse = (response: 'no' | 'yes') => {
    console.log('👤 RESPOSTA DO USUÁRIO:', response)
    
    if (response === 'yes') {
      console.log('✈️ USUÁRIO QUER VOO DE VOLTA')
      // Aqui você pode redirecionar para a busca de volta ou abrir outra funcionalidade
      alert('Perfeito! Vamos te ajudar a encontrar o voo de volta!')
    } else {
      console.log('❌ USUÁRIO NÃO COMPROU')
      alert('Sem problemas! Continue navegando para encontrar outras opções.')
    }
    
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h2>
            <p className="text-white/90">
              Você foi redirecionado para a <strong>{flightData.Cia.Nome}</strong>. Como foi sua experiência?
            </p>
          </div>
        </div>

        {/* Flight Info */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{flightData.Cia.Nome}</h3>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  <strong>{flightData.Origem} → {flightData.Destino}</strong>
                </p>
                <p className="text-gray-600">{formatDate(flightData.Saida)}</p>
                <p className="text-xl font-bold text-blue-600">
                  <strong>{formatCurrency(flightData.ValorTotalComTaxa)}</strong>
                </p>
                {flightData.TempoTotalStr && (
                  <p className="text-gray-600">{flightData.TempoTotalStr}</p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Você conseguiu comprar a passagem?
            </p>
            <p className="text-gray-600">
              Se você comprou, vamos te ajudar a encontrar o voo de volta!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleResponse('no')}
              className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Não comprei
            </Button>
            <Button
              size="lg"
              onClick={() => handleResponse('yes')}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              Sim, agora quero a volta!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
