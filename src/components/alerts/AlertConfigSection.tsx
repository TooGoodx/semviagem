import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUserPlan } from '../../hooks/useUserPlan'
import { useAuth } from '../../context/AuthContext'
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import PlanUpgradeOverlay from './PlanUpgradeOverlay'
import AirportMultiSelect from './AirportMultiSelect'
import { designSystem, componentClasses } from '../../styles/designSystem'
import toast from 'react-hot-toast'

/**
 * ALERTCONFIGSECTION - Sistema de Alertas Inteligentes
 *
 * FUNCIONALIDADES ATUAIS:
 * - Configuração de 1 alerta por vez
 * - Até 5 origens e 5 destinos
 * - Ranges de datas (Ida/Volta)
 * - 2 tipos: Milhas e Preço (20%)
 * - Auto-save para draft (1s debounce)
 * - Salvamento manual com validações
 *
 * ROADMAP (FASE 2):
 * - Permitir até 2 alertas salvos por usuário
 * - Exibir cards com resumo dos alertas ativos
 * - Botões "Editar" e "Excluir" em cada card
 * - Desabilitar formulário quando atingir 2 alertas
 * - Adicionar contador "1/2 alertas criados"
 *
 * ESTRUTURA DO BANCO (SUPABASE):
 * Table: user_alerts
 * Campos: id, user_id, origens[], destinos[], ida{}, volta{}, alertTypes{}, is_active, created_at
 */

interface AlertConfig {
  origens: string[]      // Até 5 aeroportos
  destinos: string[]     // Até 5 aeroportos
  ida: {
    inicio: string       // ISO date
    fim: string          // ISO date
  }
  volta: {
    inicio: string       // ISO date
    fim: string          // ISO date
  }
  alertTypes: {
    milhas: boolean      // Alertar quando houver milhas
    preco: boolean       // Alertar quando preço cair 20%
  }
}

const AlertConfigSection: React.FC = () => {
  const { plan, canConfigureAlerts, isLoading: planLoading } = useUserPlan()
  const { user } = useAuth()

  const [config, setConfig] = useState<AlertConfig>({
    origens: [],
    destinos: [],
    ida: {
      inicio: '',
      fim: '',
    },
    volta: {
      inicio: '',
      fim: '',
    },
    alertTypes: {
      milhas: false,
      preco: false,
    },
  })

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSavingAlert, setIsSavingAlert] = useState(false)
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

  // Manual save with validations
  const handleSaveAlert = async () => {
    // Validações
    if (config.origens.length === 0) {
      toast.error('Selecione pelo menos 1 origem')
      return
    }

    if (config.destinos.length === 0) {
      toast.error('Selecione pelo menos 1 destino')
      return
    }

    if (!config.ida.inicio || !config.ida.fim) {
      toast.error('Preencha as datas de IDA')
      return
    }

    if (!config.volta.inicio || !config.volta.fim) {
      toast.error('Preencha as datas de VOLTA')
      return
    }

    if (!config.alertTypes.milhas && !config.alertTypes.preco) {
      toast.error('Selecione pelo menos 1 tipo de alerta')
      return
    }

    // Salvar alerta
    setIsSavingAlert(true)
    try {
      const response = await fetch('/.netlify/functions/save-alert-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_id: user?.sub,
          config,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar alerta')
      }

      const data = await response.json()

      toast.success('Alerta salvo com sucesso!')

      // Limpar formulário após salvar (preparar para próximo alerta)
      setConfig({
        origens: [],
        destinos: [],
        ida: { inicio: '', fim: '' },
        volta: { inicio: '', fim: '' },
        alertTypes: { milhas: false, preco: false },
      })
    } catch (error) {
      console.error('Erro ao salvar alerta:', error)
      toast.error('Não foi possível salvar o alerta. Tente novamente.')
    } finally {
      setIsSavingAlert(false)
    }
  }

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
        <Badge
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: designSystem.colors.accent, color: designSystem.colors.primary }}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Alertas Ativos
        </Badge>
      )
    }

    if (plan === 'basic') {
      return (
        <Badge
          variant="outline"
          className="text-xs border-gray-300"
          style={{ borderColor: designSystem.colors.outline, color: designSystem.colors.textSecondary }}
        >
          <Lock className="w-3 h-3 mr-1" />
          Exclusivo para Alertas na Mão
        </Badge>
      )
    }

    // plan === 'free'
    return (
      <Badge
        variant="outline"
        className="text-xs border-gray-300"
        style={{ borderColor: designSystem.colors.outline, color: designSystem.colors.textSecondary }}
      >
        <Lock className="w-3 h-3 mr-1" />
        Disponível nos planos pagos
      </Badge>
    )
  }

  return (
    <>
      <Card className="shadow-2xl border-gray-100 relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold" style={{ color: designSystem.colors.textPrimary }}>
                Configuração de Alertas
              </CardTitle>
              <p className="text-sm" style={{ color: designSystem.colors.textSecondary }}>
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
                label="Origens (até 5)"
                value={config.origens}
                onChange={(origens) => {
                  const newConfig = { ...config, origens }
                  setConfig(newConfig)
                  scheduleAutoSave(newConfig)
                }}
                maxSelections={5}
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

              {/* Date Ranges - IDA */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                  Período de IDA
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                      De:
                    </label>
                    <input
                      type="date"
                      value={config.ida.inicio}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          ida: { ...config.ida, inicio: e.target.value },
                        }
                        setConfig(newConfig)
                        scheduleAutoSave(newConfig)
                      }}
                      className={componentClasses.input.base}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                      Até:
                    </label>
                    <input
                      type="date"
                      value={config.ida.fim}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          ida: { ...config.ida, fim: e.target.value },
                        }
                        setConfig(newConfig)
                        scheduleAutoSave(newConfig)
                      }}
                      className={componentClasses.input.base}
                      min={config.ida.inicio || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Date Ranges - VOLTA */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                  Período de VOLTA
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                      De:
                    </label>
                    <input
                      type="date"
                      value={config.volta.inicio}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          volta: { ...config.volta, inicio: e.target.value },
                        }
                        setConfig(newConfig)
                        scheduleAutoSave(newConfig)
                      }}
                      className={componentClasses.input.base}
                      min={config.ida.inicio || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                      Até:
                    </label>
                    <input
                      type="date"
                      value={config.volta.fim}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          volta: { ...config.volta, fim: e.target.value },
                        }
                        setConfig(newConfig)
                        scheduleAutoSave(newConfig)
                      }}
                      className={componentClasses.input.base}
                      min={config.volta.inicio || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Alert Types */}
              <div className="space-y-4">
                <Label className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                  Tipos de Alerta
                </Label>

                <div className="space-y-4">
                  {/* Checkbox: Milhas */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.alertTypes.milhas}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          alertTypes: { ...config.alertTypes, milhas: e.target.checked },
                        }
                        setConfig(newConfig)
                        scheduleAutoSave(newConfig)
                      }}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0033AA] focus:ring-2 focus:ring-[#0033AA] transition-all"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium group-hover:text-[#0033AA] transition-colors" style={{ color: designSystem.colors.textPrimary }}>
                        Alertar quando houver passagens com milhas
                      </span>
                      <p className="text-xs mt-1" style={{ color: designSystem.colors.textMuted }}>
                        Receba notificações quando surgirem opções para usar suas milhas
                      </p>
                    </div>
                  </label>

                  {/* Checkbox: Preço (20% fixo) */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.alertTypes.preco}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          alertTypes: { ...config.alertTypes, preco: e.target.checked },
                        }
                        setConfig(newConfig)
                        scheduleAutoSave(newConfig)
                      }}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0033AA] focus:ring-2 focus:ring-[#0033AA] transition-all"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium group-hover:text-[#0033AA] transition-colors" style={{ color: designSystem.colors.textPrimary }}>
                        Alertar quando o preço cair mais de 20%
                      </span>
                      <p className="text-xs mt-1" style={{ color: designSystem.colors.textMuted }}>
                        Você será notificado quando o preço cair 20% ou mais em relação ao menor preço dos últimos 30 dias
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botão Salvar Alerta */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm" style={{ color: designSystem.colors.textMuted }}>
                    <p className="font-medium mb-1">Salve sua configuração de alerta</p>
                    <p className="text-xs">Você pode criar até 2 alertas simultâneos</p>
                  </div>

                  <button
                    type="submit"
                    onClick={handleSaveAlert}
                    disabled={isSavingAlert || !canConfigureAlerts}
                    className="btn-primary"
                    style={{
                      backgroundColor: '#22C55E',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isSavingAlert || !canConfigureAlerts ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease',
                      boxShadow: 'none',
                      opacity: isSavingAlert || !canConfigureAlerts ? 0.6 : 1,
                      minWidth: '160px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSavingAlert && canConfigureAlerts) {
                        e.currentTarget.style.backgroundColor = '#16A34A';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSavingAlert && canConfigureAlerts) {
                        e.currentTarget.style.backgroundColor = '#22C55E';
                      }
                    }}
                  >
                    {isSavingAlert ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alerta'
                    )}
                  </button>
                </div>
              </div>

              {/* Indicador de save status */}
              {(isSaving || lastSaved) && (
                <div className="flex items-center justify-end gap-2 text-sm pt-4">
                  {isSaving ? (
                    <>
                      <div
                        className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: designSystem.colors.accent }}
                      />
                      <span style={{ color: designSystem.colors.textMuted }}>Salvando...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span style={{ color: designSystem.colors.textMuted }}>
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

      {/* Modal de upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white p-6 max-w-md"
            style={{ borderRadius: designSystem.radii.xl }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: designSystem.colors.textPrimary }}>
              Upgrade Necessário
            </h3>
            <p className="text-sm mb-4" style={{ color: designSystem.colors.textSecondary }}>
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
                className="flex-1"
                style={{
                  backgroundColor: designSystem.colors.accent,
                  color: designSystem.colors.primary,
                }}
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
