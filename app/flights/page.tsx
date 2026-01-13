"use client"

import FlightResults from '@/components/FlightResults'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plane } from 'lucide-react'
import Link from 'next/link'

export default function FlightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Plane className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">TripJunto</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Resultados da busca
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="py-8">
        <FlightResults />
      </main>
    </div>
  )
}
