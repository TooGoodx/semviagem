import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap } from 'lucide-react'
import type { UserPlanType } from '../../hooks/useUserPlan'

interface PlanUpgradeOverlayProps {
  currentPlan: UserPlanType
  onUpgradeClick: () => void
}

const PlanUpgradeOverlay: React.FC<PlanUpgradeOverlayProps> = ({
  currentPlan,
  onUpgradeClick,
}) => {
  // Mensagens específicas por plano
  const getMessage = () => {
    if (currentPlan === 'free') {
      return {
        icon: <Sparkles className="w-8 h-8 text-[#F0C72F]" />,
        title: 'Desbloqueie Alertas Inteligentes',
        description:
          'Assine o plano Alertas na Mão para configurar alertas personalizados e receber avisos direto no WhatsApp antes de todo mundo.',
        ctaText: 'Ver Planos',
      }
    }

    // currentPlan === 'basic'
    return {
      icon: <Zap className="w-8 h-8 text-[#F0C72F]" />,
      title: 'Upgrade para Alertas na Mão',
      description:
        'Com o plano Alertas na Mão você pode configurar múltiplas rotas, períodos e receber alertas personalizados antes de todo mundo.',
      ctaText: 'Fazer Upgrade',
    }
  }

  const { icon, title, description, ctaText } = getMessage()

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl">
      <div className="max-w-md mx-auto text-center p-8 space-y-6">
        <div className="flex justify-center">{icon}</div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-[#060D1C]">{title}</h3>
          <p className="text-sm text-[#060D1C]/70 leading-relaxed">{description}</p>
        </div>

        {currentPlan === 'free' && (
          <div className="grid grid-cols-2 gap-3 text-left text-xs text-[#060D1C]/60">
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>Até 5 destinos favoritos</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>Alertas por WhatsApp</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>2 períodos de viagem</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>Busca ilimitada</span>
            </div>
          </div>
        )}

        {currentPlan === 'basic' && (
          <div className="flex flex-col gap-2 text-left text-xs text-[#060D1C]/60 bg-gradient-to-r from-[#F0C72F]/10 to-transparent p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>Configure até 5 destinos simultâneos</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>Receba alertas em tempo real no WhatsApp</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F0C72F] font-bold">✓</span>
              <span>Monitore 2 períodos de viagem diferentes</span>
            </div>
          </div>
        )}

        <Button
          onClick={onUpgradeClick}
          size="lg"
          className="w-full bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329] font-semibold"
        >
          {ctaText}
        </Button>

        {currentPlan === 'free' && (
          <p className="text-xs text-[#060D1C]/50">
            A partir de R$ 29,90/mês · Cancele quando quiser
          </p>
        )}
      </div>
    </div>
  )
}

export default PlanUpgradeOverlay
