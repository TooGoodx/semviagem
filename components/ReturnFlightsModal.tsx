"use client"

import React from 'react'
import { X, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FlightCard from './FlightCard'

interface ReturnFlightsModalProps {
  isOpen: boolean
  onClose: () => void
  flights: any[]
}

export default function ReturnFlightsModal({ isOpen, onClose, flights }: ReturnFlightsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 text-white bg-indigo-600">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Selecione o voo de volta</h2>
                <p className="text-white/90 text-sm">Mostrando opções disponíveis para o trecho de retorno</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Conteúdo - lista de voos de volta */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {flights.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🛬</div>
              <p className="text-gray-600 font-medium">Nenhum voo de volta encontrado para os critérios selecionados.</p>
              <p className="text-gray-400 text-sm">Tente alterar a data ou as opções de busca.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flights.map(f => (
                <FlightCard key={f.Token} flightData={f} allFlights={flights} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center text-sm bg-gray-50">
          <p className="text-gray-600">Escolha um voo de volta para continuar.</p>
        </div>
      </div>
    </div>
  )
}
