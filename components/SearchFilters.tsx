"use client"

import React, { useState } from 'react'
import { Search, Users, CreditCard, ArrowUpDown, Route, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  onNewSearch: () => void
  flights: any[]
  loading: boolean
}

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

export default function SearchFilters({ 
  onFiltersChange, 
  onNewSearch, 
  flights, 
  loading 
}: SearchFiltersProps) {
  const router = useRouter()
  
  // Estados dos filtros
  const [filters, setFilters] = useState<SearchFilters>({
    passengers: { adults: 1, children: 0, babies: 0 },
    paymentType: 'both',
    sortBy: 'price',
    tripType: 'oneway',
    airline: 'all',
    stops: 'all'
  })

  // Função para atualizar filtros
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
    console.log('Filtros atualizados:', updatedFilters)
  }

  // Função para nova busca
  const handleNewSearch = () => {
    console.log('Executando nova busca com filtros:', filters)
    router.push('/')  // Redireciona para a página inicial para nova busca
  }

  // Função para resetar filtros
  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      passengers: { adults: 1, children: 0, babies: 0 },
      paymentType: 'both',
      sortBy: 'price',
      tripType: 'oneway',
      airline: 'all',
      stops: 'all'
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  // Obter companhias únicas dos voos
  const airlines = Array.from(new Set(flights.map(flight => flight?.Cia?.Nome).filter(Boolean)))

  // Calcular total de passageiros
  const totalPassengers = filters.passengers.adults + filters.passengers.children + filters.passengers.babies

  // Filtrar voos baseado no tipo de pagamento
  const getPaymentTypeDescription = () => {
    switch (filters.paymentType) {
      case 'money': return 'Apenas dinheiro (R$)'
      case 'miles': return 'Apenas milhas'
      case 'both': return 'Ambos os tipos'
      default: return 'Ambos os tipos'
    }
  }

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-blue-600" />
            <span>Filtros de Busca</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetFilters}
              className="text-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button 
              size="sm"
              onClick={handleNewSearch}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 mr-1" />
              Nova Busca
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          
          {/* Filtro de Passageiros */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Passageiros
            </label>
            <Select 
              value={`${filters.passengers.adults}-${filters.passengers.children}-${filters.passengers.babies}`}
              onValueChange={(value) => {
                const [adults, children, babies] = value.split('-').map(Number)
                updateFilters({ passengers: { adults, children, babies } })
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {totalPassengers} passageiro{totalPassengers > 1 ? 's' : ''}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-0-0">
                  <div className="flex flex-col">
                    <span>1 passageiro</span>
                    <span className="text-xs text-gray-500">1 adulto</span>
                  </div>
                </SelectItem>
                <SelectItem value="2-0-0">
                  <div className="flex flex-col">
                    <span>2 passageiros</span>
                    <span className="text-xs text-gray-500">2 adultos</span>
                  </div>
                </SelectItem>
                <SelectItem value="1-1-0">
                  <div className="flex flex-col">
                    <span>2 passageiros</span>
                    <span className="text-xs text-gray-500">1 adulto, 1 criança</span>
                  </div>
                </SelectItem>
                <SelectItem value="2-1-0">
                  <div className="flex flex-col">
                    <span>3 passageiros</span>
                    <span className="text-xs text-gray-500">2 adultos, 1 criança</span>
                  </div>
                </SelectItem>
                <SelectItem value="2-0-1">
                  <div className="flex flex-col">
                    <span>3 passageiros</span>
                    <span className="text-xs text-gray-500">2 adultos, 1 bebê</span>
                  </div>
                </SelectItem>
                <SelectItem value="3-0-0">
                  <div className="flex flex-col">
                    <span>3 passageiros</span>
                    <span className="text-xs text-gray-500">3 adultos</span>
                  </div>
                </SelectItem>
                <SelectItem value="4-0-0">
                  <div className="flex flex-col">
                    <span>4 passageiros</span>
                    <span className="text-xs text-gray-500">4 adultos</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Tipo de Pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Tipo de Pagamento
            </label>
            <Select 
              value={filters.paymentType} 
              onValueChange={(value: 'money' | 'miles' | 'both') => updateFilters({ paymentType: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {getPaymentTypeDescription()}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">
                  <div className="flex flex-col">
                    <span>Ambos os tipos</span>
                    <span className="text-xs text-gray-500">Dinheiro e milhas</span>
                  </div>
                </SelectItem>
                <SelectItem value="money">
                  <div className="flex flex-col">
                    <span>Apenas dinheiro</span>
                    <span className="text-xs text-gray-500">Pagamento em R$</span>
                  </div>
                </SelectItem>
                <SelectItem value="miles">
                  <div className="flex flex-col">
                    <span>Apenas milhas</span>
                    <span className="text-xs text-gray-500">Pagamento com pontos</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Ordenação */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Ordenação
            </label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value: 'price' | 'duration' | 'departure' | 'arrival') => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {filters.sortBy === 'price' ? 'Por preço' :
                     filters.sortBy === 'duration' ? 'Por duração' :
                     filters.sortBy === 'departure' ? 'Por saída' : 'Por chegada'}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Por preço</SelectItem>
                <SelectItem value="duration">Por duração</SelectItem>
                <SelectItem value="departure">Por horário de saída</SelectItem>
                <SelectItem value="arrival">Por horário de chegada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Tipo de Viagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Route className="h-4 w-4 mr-1" />
              Tipo de Viagem
            </label>
            <Select 
              value={filters.tripType} 
              onValueChange={(value: 'roundtrip' | 'oneway') => updateFilters({ tripType: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center">
                    <Route className="h-4 w-4 mr-2" />
                    {filters.tripType === 'roundtrip' ? 'Ida e volta' : 'Somente ida'}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oneway">
                  <div className="flex flex-col">
                    <span>Somente ida</span>
                    <span className="text-xs text-gray-500">Viagem só de ida</span>
                  </div>
                </SelectItem>
                <SelectItem value="roundtrip">
                  <div className="flex flex-col">
                    <span>Ida e volta</span>
                    <span className="text-xs text-gray-500">Viagem com volta</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Companhia */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Companhia</label>
            <Select 
              value={filters.airline} 
              onValueChange={(value) => updateFilters({ airline: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as companhias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {airlines.map(airline => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Paradas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Paradas</label>
            <Select 
              value={filters.stops} 
              onValueChange={(value) => updateFilters({ stops: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="direct">Apenas diretos</SelectItem>
                <SelectItem value="stops">Com paradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo dos filtros ativos */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{totalPassengers} passageiro{totalPassengers > 1 ? 's' : ''}</span>
          </Badge>
          
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CreditCard className="h-3 w-3" />
            <span>{getPaymentTypeDescription()}</span>
          </Badge>
          
          <Badge variant="secondary" className="flex items-center space-x-1">
            <ArrowUpDown className="h-3 w-3" />
            <span>
              {filters.sortBy === 'price' ? 'Por preço' :
               filters.sortBy === 'duration' ? 'Por duração' :
               filters.sortBy === 'departure' ? 'Por saída' : 'Por chegada'}
            </span>
          </Badge>
          
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Route className="h-3 w-3" />
            <span>{filters.tripType === 'roundtrip' ? 'Ida e volta' : 'Somente ida'}</span>
          </Badge>

          {filters.airline !== 'all' && (
            <Badge variant="outline">
              {filters.airline}
            </Badge>
          )}

          {filters.stops !== 'all' && (
            <Badge variant="outline">
              {filters.stops === 'direct' ? 'Diretos' : 'Com paradas'}
            </Badge>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {flights.length} voos encontrados
            </span>
            {!loading && flights.length > 0 && (
              <span>
                A partir de R$ {Math.min(...flights.map(f => f.ValorTotalComTaxa || f.ValorAdulto || 0)).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
                Carregando...
              </span>
            ) : (
              <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
