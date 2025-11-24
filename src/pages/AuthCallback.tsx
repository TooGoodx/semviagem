import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';

/**
 * Página de callback do Auth0
 * Processa o retorno da autenticação e redireciona para o dashboard
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, error } = useAuth0();

  useEffect(() => {
    const processCallback = async () => {
      // Se houver erro na autenticação
      if (error) {
        console.error('Erro no Auth0:', error);
        toast.error('Erro ao fazer login. Tente novamente.');
        navigate('/login', { replace: true });
        return;
      }

      // Aguarda o Auth0 processar
      if (isLoading) {
        return;
      }

      // Se não autenticado após loading, redireciona
      if (!isAuthenticated || !user) {
        toast.error('Não foi possível completar o login.');
        navigate('/login', { replace: true });
        return;
      }

      // Se autenticado com sucesso
      try {
        let userName = user.name || user.given_name || user.nickname || user.email?.split('@')[0];
        let isNewRegistration = false;

        // PASSO 1: Processa dados de registro pendente (se houver)
        const pendingData = localStorage.getItem('pendingRegistration');
        const pendingSocialData = localStorage.getItem('pendingSocialLogin');

        // Prepara dados do usuário para salvar no Supabase
        let userData: any = {
          auth0_id: user.sub,
          email: user.email,
          name: userName,
        };

        if (pendingData) {
          // Registro com formulário preenchido (email/password registration)
          try {
            const registrationData = JSON.parse(pendingData);
            console.log('📝 Processando registro com formulário:', registrationData);

            userData = {
              ...userData,
              name: registrationData.name || userName,
              phone: registrationData.phone,
              instagram: registrationData.instagram,
              accept_marketing: registrationData.acceptMarketing,
            };

            userName = registrationData.name || userName;
            isNewRegistration = true;

            // Limpa registro pendente
            localStorage.removeItem('pendingRegistration');
          } catch (err) {
            console.error('Erro ao processar dados de registro:', err);
          }
        } else if (pendingSocialData) {
          // Login social com dados do modal de WhatsApp
          try {
            const socialData = JSON.parse(pendingSocialData);
            console.log('📱 Processando login social com WhatsApp:', {
              provider: socialData.provider,
              hasPhone: !!socialData.phone,
              hasInstagram: !!socialData.instagram
            });

            userData = {
              ...userData,
              phone: socialData.phone,
              instagram: socialData.instagram,
              accept_marketing: socialData.acceptMarketing,
            };

            // Para Google SSO, pega dados adicionais do perfil Auth0 se disponível
            if (user.given_name || user.family_name) {
              userData.name = `${user.given_name || ''} ${user.family_name || ''}`.trim() || userName;
            }

            isNewRegistration = true;

            // Limpa dados do social login
            localStorage.removeItem('pendingSocialLogin');
          } catch (err) {
            console.error('Erro ao processar dados de social login:', err);
          }
        } else {
          // Login normal sem dados pendentes (usuário existente retornando)
          console.log('🔐 Login de usuário existente (sem dados pendentes)');

          // Para Google SSO, pega dados adicionais do perfil Auth0 se disponível
          if (user.given_name || user.family_name) {
            userData.name = `${user.given_name || ''} ${user.family_name || ''}`.trim() || userName;
          }
        }

        // SEMPRE salva/atualiza o usuário no Supabase (upsert)
        // Isso garante que usuários de Google SSO também sejam salvos
        try {
          console.log('💾 Salvando/atualizando usuário no Supabase:', {
            auth0_id: userData.auth0_id,
            email: userData.email,
            hasPhone: !!userData.phone
          });

          const saveResponse = await fetch('/.netlify/functions/save-user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          if (!saveResponse.ok) {
            const errorText = await saveResponse.text();
            console.error('❌ Erro ao salvar dados do usuário:', errorText);
            // Continua mesmo com erro - não bloqueia o login
          } else {
            console.log('✅ Usuário salvo/atualizado com sucesso no Supabase');
          }
        } catch (saveError) {
          console.error('❌ Erro ao salvar usuário:', saveError);
          // Continua mesmo com erro - não bloqueia o login
        }

        // Mostra mensagem apropriada (removido para UX mais limpa)
        // if (isNewRegistration) {
        //   toast.success(`Bem-vindo, ${userName}! 🎉`);
        // } else {
        //   toast.success(`Bem-vindo de volta, ${userName}! 👋`);
        // }

        // PASSO 2: Verifica status da assinatura (sem forçar modal)
        try {
          console.log('🔍 Verificando status de assinatura...');

          const subscriptionResponse = await fetch(
            `/.netlify/functions/check-subscription?auth0_id=${encodeURIComponent(user.sub)}`
          );

          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            const hasSubscription = subscriptionData.hasSubscription || subscriptionData.hasActiveSubscription || false;

            console.log('📊 Status de assinatura:', {
              hasSubscription,
              status: subscriptionData.subscription_status || 'free',
              response: subscriptionData
            });

            // Armazena status para uso dos componentes
            sessionStorage.setItem('subscription_status', JSON.stringify({
              hasSubscription,
              checkedAt: new Date().toISOString(),
              status: subscriptionData.subscription_status || 'free'
            }));

            // Se não tem assinatura, marca para mostrar banner discreto (não modal)
            if (!hasSubscription) {
              sessionStorage.setItem('show_subscription_banner', 'true');
              console.log('ℹ️ Usuário sem assinatura Premium (free tier)');
            } else {
              console.log('⭐ Usuário Premium ativo');
            }
          } else {
            const errorText = await subscriptionResponse.text();
            console.warn('⚠️ Erro ao verificar assinatura:', subscriptionResponse.status, errorText);

            // Define como free por padrão em caso de erro
            sessionStorage.setItem('subscription_status', JSON.stringify({
              hasSubscription: false,
              checkedAt: new Date().toISOString(),
              status: 'free'
            }));
          }
        } catch (subError) {
          console.error('❌ Erro ao verificar assinatura:', subError);

          // Define como free por padrão em caso de erro
          sessionStorage.setItem('subscription_status', JSON.stringify({
            hasSubscription: false,
            checkedAt: new Date().toISOString(),
            status: 'free'
          }));

          // Continua mesmo com erro - não bloqueia o acesso
        }

        // PASSO 3: Redireciona para dashboard
        console.log('✅ Autenticação completa, redirecionando para /dashboard');
        navigate('/dashboard', { replace: true });

      } catch (err) {
        console.error('Erro inesperado no callback:', err);
        toast.error('Ocorreu um erro, mas você foi autenticado.');
        // Mesmo com erro, redireciona para dashboard
        navigate('/dashboard', { replace: true });
      }
    };

    processCallback();
  }, [isAuthenticated, isLoading, user, error, navigate]);

  // Loading screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2f6]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F0C72F] mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#060D1C]">Autenticando...</h2>
          <p className="text-[#060D1C]/70">
            Aguarde enquanto processamos seu login
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
