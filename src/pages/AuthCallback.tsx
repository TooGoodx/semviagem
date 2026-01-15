import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';

/**
 * Página de callback do Auth0
 * SIMPLIFICADO: useAuth cria o usuário automaticamente no Supabase
 * Esta página apenas aguarda e redireciona para o dashboard
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, error } = useAuth0();

  useEffect(() => {
    const processCallback = async () => {
      // Se houver erro na autenticação
      if (error) {
        console.error('❌ Erro no Auth0:', error);
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
        console.error('❌ Não autenticado após callback');
        toast.error('Não foi possível completar o login.');
        navigate('/login', { replace: true });
        return;
      }

      // Auth0 OK - useAuth criará o usuário no Supabase automaticamente
      console.log('✅ Auth0 callback completo');
      console.log('   Email:', user.email);
      console.log('   Nome:', user.name);
      console.log('→ Redirecionando para dashboard (useAuth cria usuário se necessário)');

      // Limpa qualquer dado pendente antigo
      localStorage.removeItem('pendingRegistration');
      localStorage.removeItem('pendingSocialLogin');

      // Redireciona direto para dashboard
      navigate('/dashboard', { replace: true });
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
