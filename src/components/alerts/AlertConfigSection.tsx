import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useUser } from '../../context/UserContext'
import { usePermissions } from '../../hooks/usePermissions'
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import PlanUpgradeOverlay from './PlanUpgradeOverlay'
import AirportMultiSelect from './AirportMultiSelect'
import AlertsList from './AlertsList'
import { designSystem, componentClasses } from '../../styles/designSystem'
import toast from 'react-hot-toast'
import { createAlert, getUserAlerts, type Alert } from '../../lib/supabase'
import { WhatsAppService } from '../../services/whatsappService'

/**
 * ALERTCONFIGSECTION - Sistema de Alertas Inteligentes
 *
 * FUNCIONALIDADES ATUAIS:
 * - Configuração de 1 alerta por vez
 * - Até 5 origens e 5 destinos
 * - Ranges de datas (Ida/Volta)
 * - 2 tipos: Milhas e Preço (customizável)
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
 * Campos: id, user_id, origens[], destinos[], ida{}, volta{}, alertTypes{}, maxPrice, is_active, created_at
 */

// TODO: Implementar em Sprint 3 Fase 2
// Interface para alertas salvos (múltiplos alertas)
interface SavedAlert {
  id: string
  name: string
  origens: string[]
  destinos: string[]
  createdAt: string
  isActive: boolean
}

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
    preco: boolean       // Alertar quando preço cair abaixo de maxPrice
  }
  maxPrice?: number      // Preço máximo para alertas (opcional)
}

const AlertConfigSection: React.FC = () => {
  const { user, auth0User, subscription_status } = useUser()
  const { canCreateAlerts, maxAlerts } = usePermissions()

  // Derived permission state
  const canConfigureAlerts = canCreateAlerts

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
    maxPrice: undefined,
  })

  // WhatsApp - número vem do perfil do usuário (Supabase)
  const hasWhatsApp = !!(user?.whatsapp && user.whatsapp.trim() !== '')
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(hasWhatsApp)
  const [alertName, setAlertName] = useState('')

  // Saved alerts state
  const [savedAlerts, setSavedAlerts] = useState<Alert[]>([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSavingAlert, setIsSavingAlert] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing alerts on mount
  useEffect(() => {
    if (user?.id) {
      loadUserAlerts()
    }
  }, [user?.id])

  const loadUserAlerts = async () => {
    if (!user?.id) return
    setIsLoadingAlerts(true)
    try {
      const alerts = await getUserAlerts(user.id)
      setSavedAlerts(alerts)
      console.log('Loaded user alerts:', alerts.length)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  // Auto-save function
  const saveConfig = useCallback(async (configToSave: AlertConfig) => {
    if (!auth0User?.sub) {
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
          auth0_id: auth0User.sub,
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
  }, [auth0User])

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

  // Manual save with validations - Now saves directly to Supabase
  const handleSaveAlert = async () => {
    // Permission validation
    if (!canConfigureAlerts) {
      toast.error('Upgrade para Alertas Inteligentes para salvar alertas')
      return
    }

    if (!user?.id || !auth0User?.sub) {
      toast.error('Usuário não autenticado')
      return
    }

    // Check alert limit
    if (savedAlerts.length >= maxAlerts) {
      toast.error(`Você já atingiu o limite de ${maxAlerts} alertas`)
      return
    }

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

    if (config.alertTypes.preco && !config.maxPrice) {
      toast.error('Defina o preço máximo para alertas de preço')
      return
    }

    // Salvar alerta diretamente no Supabase
    setIsSavingAlert(true)
    try {
      // Generate alert name if not provided
      const generatedName = alertName || `${config.origens[0]} -> ${config.destinos[0]}`

      const alertData = {
        user_id: user.id,
        auth0_id: auth0User.sub,
        alert_name: generatedName,
        origins: config.origens,
        destinations: config.destinos,
        departure_start: config.ida.inicio,
        departure_end: config.ida.fim,
        return_start: config.volta.inicio || undefined,
        return_end: config.volta.fim || undefined,
        max_price_miles: config.alertTypes.milhas ? undefined : undefined,
        max_price_brl: config.alertTypes.preco ? config.maxPrice : undefined,
        alert_types: config.alertTypes,
        is_active: true,
        notify_whatsapp: notifyWhatsapp && hasWhatsApp,
        notify_email: true
      }

      const savedAlert = await createAlert(alertData)

      if (!savedAlert) {
        throw new Error('Erro ao salvar alerta no banco de dados')
      }

      // Send WhatsApp confirmation if enabled
      if (notifyWhatsapp && hasWhatsApp && user?.whatsapp) {
        try {
          await WhatsAppService.sendAlertCreatedMessage(
            user.whatsapp,
            generatedName,
            config.origens,
            config.destinos
          )
          console.log('WhatsApp confirmation sent')
        } catch (whatsappError) {
          console.warn('WhatsApp notification failed:', whatsappError)
          // Don't fail the alert creation if WhatsApp fails
        }
      }

      toast.success('Alerta salvo com sucesso!')

      // Reload alerts list
      await loadUserAlerts()

      // Limpar formulário após salvar (preparar para próximo alerta)
      setConfig({
        origens: [],
        destinos: [],
        ida: { inicio: '', fim: '' },
        volta: { inicio: '', fim: '' },
        alertTypes: { milhas: false, preco: false },
        maxPrice: undefined,
      })
      setAlertName('')
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
    if (subscription_status === 'alertas_inteligentes') {
      return (
        <Badge
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: designSystem.colors.accent, color: designSystem.colors.primary }}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Alertas Ativos ({maxAlerts} disponíveis)
        </Badge>
      )
    }

    if (subscription_status === 'busca_ilimitada') {
      return (
        <Badge
          variant="outline"
          className="text-xs border-gray-300"
          style={{ borderColor: designSystem.colors.outline, color: designSystem.colors.textSecondary }}
        >
          <Lock className="w-3 h-3 mr-1" />
          Upgrade para Alertas Inteligentes
        </Badge>
      )
    }

    // subscription_status === 'free'
    return (
      <Badge
        variant="outline"
        className="text-xs border-gray-300"
        style={{ borderColor: designSystem.colors.outline, color: designSystem.colors.textSecondary }}
      >
        <Lock className="w-3 h-3 mr-1" />
        Disponível no plano Alertas Inteligentes
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
          {/* TODO: Seção de Alertas Salvos (Sprint 3 Fase 2) */}
          {/*
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold" style={{ color: designSystem.colors.textPrimary }}>
                Seus Alertas Ativos (0/2)
              </h3>

              // Cards dos alertas salvos aqui
              // [GRU→MIA | 10-20 Dez | Milhas + Preço] [Editar] [Excluir]
            </div>
          */}

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

          {/* Saved Alerts List */}
          {savedAlerts.length > 0 && (
            <div className="mb-6">
              <AlertsList
                alerts={savedAlerts}
                onAlertUpdated={loadUserAlerts}
                isLoading={isLoadingAlerts}
                maxAlerts={maxAlerts}
              />
            </div>
          )}

          {/* Limit reached warning */}
          {savedAlerts.length >= maxAlerts && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Limite atingido!</strong> Você já tem {maxAlerts} alertas.
                Exclua um alerta existente para criar um novo.
              </p>
            </div>
          )}

          {/* Conteúdo da configuração (sempre renderizado, DESBLOQUEADO temporariamente) */}
          <div className={/* !canConfigureAlerts ? 'opacity-30 pointer-events-none' : '' */ ''}>
            <div className="space-y-6">
              {/* Nome do Alerta */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                  Nome do Alerta (opcional)
                </Label>
                <Input
                  type="text"
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  placeholder="Ex: Férias Miami 2025"
                  className={componentClasses.input.base}
                />
                <p className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                  Se não informado, será gerado automaticamente baseado nas rotas
                </p>
              </div>

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

                  {/* Checkbox: Preço (customizável) */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={config.alertTypes.preco}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            alertTypes: { ...config.alertTypes, preco: e.target.checked },
                            maxPrice: e.target.checked ? config.maxPrice : undefined,
                          }
                          setConfig(newConfig)
                          scheduleAutoSave(newConfig)
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0033AA] focus:ring-2 focus:ring-[#0033AA] transition-all"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium group-hover:text-[#0033AA] transition-colors" style={{ color: designSystem.colors.textPrimary }}>
                          Alertar quando o preço cair abaixo de
                        </span>
                        <p className="text-xs mt-1" style={{ color: designSystem.colors.textMuted }}>
                          Defina um valor máximo e seja notificado quando o preço ficar abaixo dele
                        </p>
                      </div>
                    </label>

                    {/* Campo Preço Máximo (condicional) */}
                    {config.alertTypes.preco && (
                      <div className="ml-7 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium" style={{ color: designSystem.colors.textSecondary }}>
                          R$
                        </span>
                        <Input
                          type="number"
                          value={config.maxPrice || ''}
                          onChange={(e) => {
                            const newConfig = {
                              ...config,
                              maxPrice: e.target.value ? parseInt(e.target.value) : undefined,
                            }
                            setConfig(newConfig)
                            scheduleAutoSave(newConfig)
                          }}
                          placeholder="4000"
                          className={`${componentClasses.input.base} w-32`}
                          min="0"
                          step="100"
                        />
                        <span className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                          preço máximo desejado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* WhatsApp Notification Settings - Mesmo estilo dos checkboxes acima */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={notifyWhatsapp}
                    onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                    disabled={!hasWhatsApp}
                    className={`mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0033AA] focus:ring-2 focus:ring-[#0033AA] transition-all ${!hasWhatsApp ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex-1">
                    <span className={`text-sm font-medium transition-colors ${hasWhatsApp ? 'group-hover:text-[#0033AA]' : ''}`} style={{ color: designSystem.colors.textPrimary }}>
                      Receber alertas via WhatsApp
                    </span>
                    <p className="text-xs mt-1" style={{ color: designSystem.colors.textMuted }}>
                      {hasWhatsApp ? (
                        <>Seu numero: {user?.whatsapp}</>
                      ) : (
                        <span className="text-amber-600">
                          <a
                            href="/profile"
                            className="underline hover:text-[#0033AA] transition-colors"
                          >
                            Adicione seu WhatsApp no Perfil
                          </a>
                          {' '}para receber alertas
                        </span>
                      )}
                    </p>
                  </div>
                </label>
              </div>

              {/* Botão Salvar Alerta */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm" style={{ color: designSystem.colors.textMuted }}>
                    <p className="font-medium mb-1">Salve sua configuração de alerta</p>
                    <p className="text-xs">Você pode criar até {maxAlerts} alertas simultâneos</p>
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
            className="bg-white p-6 max-w-md rounded-xl"
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: designSystem.colors.textPrimary }}>
              Upgrade Necessário
            </h3>
            <p className="text-sm mb-4" style={{ color: designSystem.colors.textSecondary }}>
              {subscription_status === 'free' && 'A Configuração de Alertas está disponível no plano Alertas Inteligentes (R$ 29,90/mês).'}
              {subscription_status === 'busca_ilimitada' && 'A Configuração de Alertas é exclusiva para assinantes do plano Alertas Inteligentes.'}
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
