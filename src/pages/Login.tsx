import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import SemViagemIcon from '../components/SemViagemIcon';
import AuthTabs from '../components/auth/AuthTabs';
import { designSystem } from '../styles/designSystem';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading, user } = useAuth0();

  // REMOVED: Premature useEffect that was checking auth before callback completed
  // Authentication checking is now handled by AuthCallback.tsx

  const buildRedirectParams = (extra?: Record<string, string>) => ({
    authorizationParams: {
      redirect_uri: `${window.location.origin}/auth/callback`,
      ...extra,
    },
  });

  const handleEmailLogin = () => {
    // Add connection parameter for email/password login
    loginWithRedirect(buildRedirectParams({
      connection: 'Username-Password-Authentication'
    }));
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'github' | 'linkedin') => {
    const connectionMap: Record<typeof provider, string> = {
      google: 'google-oauth2',
      facebook: 'facebook',
      github: 'github',
      linkedin: 'linkedin',
    };
    loginWithRedirect(buildRedirectParams({ connection: connectionMap[provider] }));
  };

  const handleRegister = (data: {
    name: string;
    email: string;
    phone: string;
    acceptMarketing: boolean;
  }) => {
    localStorage.setItem(
      'pendingRegistration',
      JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    );

    loginWithRedirect(
      buildRedirectParams({
        screen_hint: 'signup',
        login_hint: data.email,
      }),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2"
          style={{ borderColor: designSystem.colors.accent }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2f6] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <SemViagemIcon size={72} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: designSystem.colors.primary }}>
            <span style={{ color: designSystem.colors.primary }}>Sem</span>
            <span style={{ color: designSystem.colors.accent }}>Viagem</span>
          </h1>
          <p className="text-sm opacity-80" style={{ color: designSystem.colors.textPrimary }}>
            Entre para acessar suas buscas e alertas personalizados.
          </p>
        </div>

        <AuthTabs
          initialTab="login"
          onEmailLogin={handleEmailLogin}
          onSocialLogin={handleSocialLogin}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
};

export default Login;
