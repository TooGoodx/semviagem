import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserPlan } from '../../hooks/useUserPlan'
import { useAuth } from '../../context/AuthContext'
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import PlanUpgradeOverlay from './PlanUpgradeOverlay'
import AirportMultiSelect from './AirportMultiSelect'

interface AlertConfig {
  origens: string[]  // Até 3 códigos IATA
  destinos: string[] // Até 5 códigos IATA
  dateRanges: DateRange[] // Até 2 ranges
  alertTypes: {
    milhas: boolean
    preco: boolean
  }
}

interface DateRange {
  inicio: string  // ISO date
  fim: string     // ISO date
}

const AlertConfigSection: React.FC = () => {
  const { plan, canConfigureAlerts, isLoading: planLoading } = useUserPlan()
  const { user } = useAuth()

  const [config, setConfig] = useState<AlertConfig>({
    origens: [],
    destinos: [],
    dateRanges: [],
    alertTypes: {
      milhas: true,
      preco: true,
    },
  })

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save function
  const saveConfig = useCallback(async (configToSave: AlertConfig) => {
    if (!user?.sub) {
      console.warn('Usuário não autenticado, não pode salvar alertas')
      return
    }

    // Validar se tem pelo menos algo configurado
    const hasConfig = configToSave.origens.length > 0 || configToSave.destinos.length > 0
    if (!hasConfig) {
      console.log('Nenhuma configuração para salvar')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/.netlify/functions/save-alert-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_id: user.sub,
          config: configToSave,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configuração')
      }

      setLastSaved(new Date())
      console.log('Alertas salvos automaticamente')
    } catch (error) {
      console.error('Erro ao salvar alertas:', error)
    } finally {
      setIsSaving(false)
    }
  }, [user])

  // Debounced auto-save
  const scheduleAutoSave = useCallback((newConfig: AlertConfig) => {
    // Limpar timer anterior
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // Agendar novo save após 1 segundo
    saveTimerRef.current = setTimeout(() => {
      saveConfig(newConfig)
    }, 1000)
  }, [saveConfig])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // Badge de status baseado no plano
  const renderPlanBadge = () => {
    if (planLoading) {
      return (
        <Badge variant="secondary" className="text-xs">
          Carregando...
        </Badge>
      )
    }

    if (plan === 'pro') {
      return (
        <Badge className="bg-[#F0C72F] text-[#060D1C] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 mr-1" />
          Alertas Ativos
        </Badge>
      )
    }

    if (plan === 'basic') {
      return (
        <Badge variant="outline" className="text-xs border-gray-300">
          <Lock className="w-3 h-3 mr-1" />
          Exclusivo para Alertas na Mão
        </Badge>
      )
    }

    // plan === 'free'
    return (
      <Badge variant="outline" className="text-xs border-gray-300">
        <Lock className="w-3 h-3 mr-1" />
        Disponível nos planos pagos
      </Badge>
    )
  }

  return (
    <>
      <Card className="shadow-[0_30px_70px_rgba(6,13,28,0.12)] border-gray-100 relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-[#060D1C]">
                Configuração de Alertas
              </CardTitle>
              <p className="text-sm text-[#060D1C]/70">
                Defina suas rotas e datas favoritas para receber alertas inteligentes direto no WhatsApp.
              </p>
            </div>
            {renderPlanBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* ⚠️ TEMPORÁRIO: Overlay de bloqueio DESABILITADO - Ver REGRAS_PLANOS.md */}
          {/* TODO: Descomentar após testes no Supabase */}
          {/* ==================== OVERLAY ORIGINAL (COMENTADO) ====================
          {!canConfigureAlerts && (
            <PlanUpgradeOverlay
              currentPlan={plan}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          )}
          ==================== FIM OVERLAY ORIGINAL ==================== */}

          {/* Conteúdo da configuração (sempre renderizado, DESBLOQUEADO temporariamente) */}
          <div className={/* !canConfigureAlerts ? 'opacity-30 pointer-events-none' : '' */ ''}>
            <div className="space-y-6">
              {/* Seletor de Origens */}
              <AirportMultiSelect
                label="Origens (até 3)"
                value={config.origens}
                onChange={(origens) => {
                  const newConfig = { ...config, origens }
                  setConfig(newConfig)
                  scheduleAutoSave(newConfig)
                }}
                maxSelections={3}
                placeholder="Digite o nome ou código do aeroporto de origem"
              />

              {/* Seletor de Destinos */}
              <AirportMultiSelect
                label="Destinos (até 5)"
                value={config.destinos}
                onChange={(destinos) => {
                  const newConfig = { ...config, destinos }
                  setConfig(newConfig)
                  scheduleAutoSave(newConfig)
                }}
                maxSelections={5}
                placeholder="Digite o nome ou código do destino"
              />

              {/* Placeholder para futuros componentes */}
              <div className="space-y-4 pt-2">
                <div className="text-sm text-[#060D1C]/60">
                  <strong>Períodos:</strong> Até 2 faixas de datas (em breve)
                </div>
                <div className="text-sm text-[#060D1C]/60">
                  <strong>Tipos:</strong> Alertas de Milhas e/ou Preço (em breve)
                </div>
              </div>

              {/* Indicador de save status */}
              {(isSaving || lastSaved) && (
                <div className="flex items-center justify-end gap-2 text-sm pt-4">
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-[#F0C72F] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[#060D1C]/60">Salvando...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-[#060D1C]/60">
                        Salvo automaticamente
                      </span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de upgrade (será implementado) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl max-w-md">
            <h3 className="text-lg font-bold text-[#060D1C] mb-2">
              Upgrade Necessário
            </h3>
            <p className="text-sm text-[#060D1C]/70 mb-4">
              {plan === 'free' && 'A Configuração de Alertas está disponível nos planos Milhas na Mão e Alertas na Mão.'}
              {plan === 'basic' && 'A Configuração de Alertas é exclusiva para assinantes do plano Alertas na Mão.'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  window.open('https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02', '_blank')
                  setShowUpgradeModal(false)
                }}
                className="flex-1 bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AlertConfigSection
