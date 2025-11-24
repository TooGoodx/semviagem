import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Tipos de plano disponíveis:
 * - free: Usuário cadastrado sem assinatura (busca limitada a 30 dias)
 * - basic: Milhas na Mão (busca ilimitada)
 * - pro: Alertas na Mão (busca ilimitada + alertas configuráveis)
 */
export type UserPlanType = 'free' | 'basic' | 'pro';

interface UserPlanStatus {
  plan: UserPlanType;
  isLoading: boolean;
  error: string | null;
  canSearchUnlimited: boolean; // true para basic e pro
  canConfigureAlerts: boolean; // true apenas para pro
}

export const useUserPlan = (): UserPlanStatus => {
  // ⚠️ TEMPORÁRIO: Desbloqueado para testes - Ver REGRAS_PLANOS.md
  // Força todos usuários como PRO para permitir testes completos
  // TODO: Descomentar lógica original após testes no Supabase

  return {
    plan: 'pro',
    isLoading: false,
    error: null,
    canSearchUnlimited: true,
    canConfigureAlerts: true,
  };

  /* ==================== CÓDIGO ORIGINAL (COMENTADO) ====================
  const { user, isAuthenticated } = useAuth();
  const [plan, setPlan] = useState<UserPlanType>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserPlan = async () => {
      if (!isAuthenticated || !user?.sub) {
        setPlan('free');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/.netlify/functions/check-subscription?auth0_id=${encodeURIComponent(user.sub)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Usuário não encontrado, considera free
            setPlan('free');
          } else {
            throw new Error('Failed to check user plan');
          }
        } else {
          const result = await response.json();
          const subscriptionStatus = result.subscription_status || 'free';

          // Mapeia o status retornado do Supabase para nosso tipo de plano
          // 'free' → 'free'
          // 'basic' ou 'milhas_na_mao' → 'basic'
          // 'premium' ou 'pro' ou 'alertas_na_mao' → 'pro'
          let userPlan: UserPlanType = 'free';

          if (subscriptionStatus === 'basic' || subscriptionStatus === 'milhas_na_mao') {
            userPlan = 'basic';
          } else if (
            subscriptionStatus === 'premium' ||
            subscriptionStatus === 'pro' ||
            subscriptionStatus === 'alertas_na_mao'
          ) {
            userPlan = 'pro';
          }

          setPlan(userPlan);
        }
      } catch (err) {
        console.error('Error checking user plan:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPlan('free'); // Default to free on error
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPlan();
  }, [isAuthenticated, user?.sub]);

  return {
    plan,
    isLoading,
    error,
    canSearchUnlimited: plan === 'basic' || plan === 'pro',
    canConfigureAlerts: plan === 'pro',
  };
  ==================== FIM CÓDIGO ORIGINAL ==================== */
};
