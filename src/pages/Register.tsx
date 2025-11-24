import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import SemViagemIcon from '../components/SemViagemIcon';
import AuthTabs from '../components/auth/AuthTabs';
import { designSystem } from '../styles/designSystem';

const Register: React.FC = () => {
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
    loginWithRedirect(
      buildRedirectParams({
        connection: connectionMap[provider],
        screen_hint: 'signup',
      }),
    );
  };

  const handleRegister = (data: {
    name: string;
    email: string;
    phone: string;
    instagram?: string;
    acceptMarketing: boolean;
  }) => {
    // Save registration data to localStorage with detailed info
    const registrationData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      instagram: data.instagram,
      acceptMarketing: data.acceptMarketing,
      timestamp: new Date().toISOString(),
      source: 'register_page'
    };

    console.log('Saving registration data to localStorage:', registrationData);
    localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));

    // Redirect to Auth0 signup with connection parameter
    loginWithRedirect(
      buildRedirectParams({
        connection: 'Username-Password-Authentication',
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
            Crie sua conta gratuita e receba alertas personalizados no WhatsApp.
          </p>
        </div>

        <AuthTabs
          initialTab="register"
          onEmailLogin={handleEmailLogin}
          onSocialLogin={handleSocialLogin}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
};

export default Register;
