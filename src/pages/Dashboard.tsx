import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth0 } from "@auth0/auth0-react"
import { useUser } from "../context/UserContext"
import { designSystem, componentClasses } from "../styles/designSystem"
// DashboardGate removed - dashboard accessible to all logged-in users
// Premium features are gated individually (alerts, etc)
import { usePermissions } from "../hooks/usePermissions"
import AlertsList from "../components/alerts/AlertsList"
import { getUserAlerts, type Alert } from "../lib/supabase"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { logout } = useAuth0()
  const { user, subscription_status, auth0User } = useUser()
  const permissions = usePermissions()

  // Alerts state
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)

  // Load user alerts
  const loadAlerts = async () => {
    if (!user?.id) return
    setIsLoadingAlerts(true)
    try {
      const userAlerts = await getUserAlerts(user.id)
      setAlerts(userAlerts)
      console.log('📊 Loaded alerts:', userAlerts.length)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  // Load alerts on mount and when user changes
  useEffect(() => {
    if (user?.id && permissions.canCreateAlerts) {
      loadAlerts()
    }
  }, [user?.id, permissions.canCreateAlerts])

  // Dashboard access logging
  useEffect(() => {
    console.log('📊 Dashboard accessed:', {
      canAccessDashboard: permissions.canAccessDashboard,
      canCreateAlerts: permissions.canCreateAlerts,
      maxAlerts: permissions.maxAlerts,
      canSearchUnlimited: permissions.canSearchUnlimited
    })
  }, [permissions])

  // Get subscription display info based on our 3-tier system
  const getSubscriptionInfo = () => {
    switch (subscription_status) {
      case 'alertas_inteligentes':
        return {
          badge: 'Alertas Inteligentes',
          emoji: '⭐',
          title: 'Aproveite alertas antecipados e buscas ilimitadas',
          description: 'Você recebe alertas exclusivos no WhatsApp e pode monitorar quantos destinos quiser.',
          showUpgrade: false,
          upgradeUrl: null
        }
      case 'busca_ilimitada':
        return {
          badge: 'Busca Ilimitada',
          emoji: '🚀',
          title: 'Busque voos em qualquer data',
          description: 'Upgrade para Alertas Inteligentes e receba notificações exclusivas no WhatsApp.',
          showUpgrade: true,
          upgradeUrl: 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02'
        }
      default: // free
        return {
          badge: 'Plano Gratuito',
          emoji: '🆓',
          title: 'Desbloqueie alertas inteligentes e buscas ilimitadas',
          description: 'Upgrade para receber alertas exclusivos no WhatsApp e buscar voos sem limite de data.',
          showUpgrade: true,
          upgradeUrl: 'https://buy.stripe.com/cNibJ3eAJetJ0ovfERdMI05'
        }
    }
  }

  const subscriptionInfo = getSubscriptionInfo()

  // Permission-based quick actions
  const quickActions = [
    {
      title: "Buscar voos",
      description: permissions.canSearchUnlimited
        ? "Busque voos em qualquer data, sem limites."
        : `Busque voos até ${permissions.searchDayLimit} dias no futuro.`,
      cta: "Abrir busca",
      onClick: () => navigate("/")
    },
    {
      title: "Alertas de preço",
      description: permissions.canCreateAlerts
        ? `Configure até ${permissions.maxAlerts} alertas ativos.`
        : "Upgrade para receber alertas exclusivos por WhatsApp.",
      cta: permissions.canCreateAlerts ? "Gerenciar alertas" : "Upgrade para alertas",
      onClick: () => permissions.canCreateAlerts
        ? navigate("/alerts")
        : window.open(subscriptionInfo.upgradeUrl || 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02', '_blank')
    },
    {
      title: "Perfil de viagem",
      description: "Atualize seus dados de contato e preferências.",
      cta: "Atualizar perfil",
      onClick: () => navigate("/profile")
    }
  ]

  const handleLogout = () => {
    try {
      console.log('🚪 Initiating Auth0 logout...')
      logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      })
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao fazer logout. Tente novamente.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2f6]">
        {/* ProfileWizard removido - dados já coletados no modal de cadastro */}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: designSystem.colors.textPrimary }}>Dashboard</h2>
            <p className="text-sm" style={{ color: designSystem.colors.textMuted }}>
              Olá {auth0User?.name || user?.full_name || 'Usuário'}! Gerencie suas buscas e alertas.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className={componentClasses.button.outline}
          >
            Sair
          </Button>
        </div>

        <Card className="border-none shadow-2xl">
          <CardContent className="flex flex-col gap-8 py-8 md:flex-row md:items-center">
            <div className="flex-1 space-y-4">
              <span
                className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                style={{
                  backgroundColor: designSystem.colors.primary,
                  color: designSystem.colors.accent
                }}
              >
                {subscriptionInfo.emoji} {subscriptionInfo.badge}
              </span>
              <h3 className="text-2xl font-bold" style={{ color: designSystem.colors.textPrimary }}>
                {subscriptionInfo.title}
              </h3>
              <p className="text-sm" style={{ color: designSystem.colors.textSecondary }}>
                {subscriptionInfo.description}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto">
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                style={{
                  borderColor: designSystem.colors.primary,
                  color: designSystem.colors.primary
                }}
                className="hover:bg-[#060D1C]/10"
              >
                Atualizar meus dados
              </Button>
              {subscriptionInfo.showUpgrade && (
                <Button
                  onClick={() => subscriptionInfo.upgradeUrl && window.open(subscriptionInfo.upgradeUrl, '_blank')}
                  className={componentClasses.button.primary}
                >
                  {subscription_status === 'free' ? 'Upgrade para Busca Ilimitada' : 'Upgrade para Alertas'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Limite de Busca</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {permissions.canSearchUnlimited ? '∞' : `${permissions.searchDayLimit} dias`}
              </div>
              <p className="text-gray-600 text-sm">
                {permissions.canSearchUnlimited ? 'Busca ilimitada ativa' : 'Limite de busca atual'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Alertas Ativos</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {permissions.canCreateAlerts ? `${alerts.filter(a => a.is_active).length}/${permissions.maxAlerts}` : '0'}
              </div>
              <p className="text-gray-600 text-sm">
                {permissions.canCreateAlerts
                  ? `${alerts.length} alertas criados`
                  : 'Upgrade para criar alertas'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Status da Conta</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {subscriptionInfo.emoji}
              </div>
              <p className="text-gray-600 text-sm">
                {subscriptionInfo.badge}
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.title} className="border-none shadow-lg">
              <CardHeader className="gap-2">
                <CardTitle className="text-lg" style={{ color: designSystem.colors.textPrimary }}>{action.title}</CardTitle>
                <p className="text-sm" style={{ color: designSystem.colors.textSecondary }}>{action.description}</p>
              </CardHeader>
              <CardContent className="pb-6">
                <Button
                  onClick={action.onClick}
                  className={componentClasses.button.primary}
                >
                  {action.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Alerts Section - Only for Alertas Inteligentes users */}
        {permissions.canCreateAlerts && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: designSystem.colors.textPrimary }}>
                Meus Alertas de Preço
              </h2>
              <Button
                onClick={() => navigate('/profile')}
                className={componentClasses.button.primary}
              >
                + Criar Novo Alerta
              </Button>
            </div>

            <AlertsList
              alerts={alerts}
              onAlertUpdated={loadAlerts}
              onEditAlert={(alert) => {
                // Navigate to profile with alert id to edit
                navigate(`/profile?editAlert=${alert.id}`)
              }}
              isLoading={isLoadingAlerts}
              maxAlerts={permissions.maxAlerts}
            />
          </section>
        )}

        <section>
          <Card
            className="border-none"
            style={{
              backgroundColor: designSystem.colors.primary,
              color: designSystem.colors.accent
            }}
          >
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Precisa de ajuda agora?</h3>
                <p className="text-sm opacity-80">
                  Fale com nosso time pelo WhatsApp e receba suporte personalizado.
                </p>
              </div>
              <Button
                asChild
                variant="secondary"
                className={componentClasses.button.primary}
              >
                <a href="https://wm.me/5531997334728" target="_blank" rel="noreferrer">
                  Abrir WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
