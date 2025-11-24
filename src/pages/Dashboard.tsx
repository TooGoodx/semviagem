import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../context/AuthContext"
import { useSubscription } from "../hooks/useSubscription"
// import ProfileWizard from "../components/onboarding/ProfileWizard" // Removido - dados já coletados no cadastro

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isPremium, isLoading: subscriptionLoading, error: subscriptionError } = useSubscription()
  // const [showWizard, setShowWizard] = useState(false) // Removido - não mais necessário

  // useEffect(() => {
  //   const completed = localStorage.getItem("sv_wizard_completed")
  //   if (!completed) {
  //     setShowWizard(true)
  //   }
  // }, []) // Removido - não mais necessário

  useEffect(() => {
    if (subscriptionError) {
      // toast.error("Não foi possível verificar sua assinatura no momento.")
      console.log("ℹ️ Subscription check error (silenced for UX):", subscriptionError)
    }
  }, [subscriptionError])

  const quickActions = useMemo(
    () => [
      {
        title: "Buscar voos",
        description: "Defina origem, destino e receba as melhores combinações de tarifas.",
        cta: "Abrir busca",
        onClick: () => navigate("/flights"),
      },
      {
        title: "Alertas inteligentes",
        description: isPremium
          ? "Configure destinos favoritos para receber promoções antecipadas."
          : "Assine o plano PRO para liberar alertas exclusivos por WhatsApp.",
        cta: isPremium ? "Configurar alertas" : "Conhecer plano PRO",
        onClick: () => (isPremium ? navigate("/profile") : navigate("/premium")),
      },
      {
        title: "Completar perfil",
        description: "Atualize seus dados de contato e preferências de viagem.",
        cta: "Ir para perfil",
        onClick: () => navigate("/profile"),
      },
    ],
    [isPremium, navigate],
  )

  const handleLogout = async () => {
    try {
      await signOut()
      navigate("/")
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
            <h2 className="text-3xl font-bold text-[#060D1C]">Dashboard</h2>
            <p className="text-sm text-[#060D1C]/70">
              Monitore alertas, configure destinos favoritos e finalize suas reservas com o melhor custo-benefício.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
          >
            Sair
          </Button>
        </div>

        <Card className="border-none shadow-[0_30px_70px_rgba(6,13,28,0.12)]">
          <CardContent className="flex flex-col gap-8 py-8 md:flex-row md:items-center">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center rounded-full bg-[#060D1C] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#F0C72F]">
                {subscriptionLoading ? "Carregando..." : isPremium ? "Plano PRO ativo" : "Plano gratuito"}
              </span>
              <h3 className="text-2xl font-bold text-[#060D1C]">
                {isPremium
                  ? "Aproveite alertas antecipados e buscas ilimitadas"
                  : "Desbloqueie alertas inteligentes e suporte premium"}
              </h3>
              <p className="text-sm text-[#060D1C]/75">
                {isPremium
                  ? "Você recebe alertas exclusivos no WhatsApp e pode monitorar quantos destinos quiser."
                  : "Assine o plano PRO para ser avisado antes de todos, direto no seu WhatsApp, assim que surgirem tarifas irresistíveis."}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto">
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="border-[#060D1C] text-[#060D1C] hover:bg-[#060D1C]/10"
              >
                Atualizar meus dados
              </Button>
              {!isPremium && (
                <Button
                  onClick={() => navigate("/premium")}
                  className="bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
                >
                  Ver benefícios do plano PRO
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.title} className="border-none shadow-[0_18px_45px_rgba(6,13,28,0.08)]">
              <CardHeader className="gap-2">
                <CardTitle className="text-lg text-[#060D1C]">{action.title}</CardTitle>
                <p className="text-sm text-[#060D1C]/75">{action.description}</p>
              </CardHeader>
              <CardContent className="pb-6">
                <Button
                  onClick={action.onClick}
                  className="bg-[#060D1C] text-[#F0C72F] hover:bg-[#060D1C]/90"
                >
                  {action.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <Card className="border-none bg-[#060D1C] text-[#F0C72F]">
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Precisa de ajuda agora?</h3>
                <p className="text-sm text-[#F0C72F]/80">
                  Fale com nosso time pelo WhatsApp e receba suporte personalizado.
                </p>
              </div>
              <Button
                asChild
                variant="secondary"
                className="bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
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
