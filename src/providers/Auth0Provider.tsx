import React from 'react';
import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { AUTH0_CONFIG } from '../config/auth0';

interface Auth0ProviderProps {
  children: React.ReactNode;
}

const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children }) => {
  const {
    redirectUri,
    audience,
    scope,
    authorizationParams,
  } = AUTH0_CONFIG as {
    redirectUri?: string;
    audience?: string;
    scope?: string;
    authorizationParams?: { redirect_uri?: string; audience?: string; scope?: string };
  };

  return (
    <Auth0ProviderBase
      domain={AUTH0_CONFIG.domain}
      clientId={AUTH0_CONFIG.clientId}
      authorizationParams={{
        redirect_uri: authorizationParams?.redirect_uri ?? redirectUri,
        audience: authorizationParams?.audience ?? audience,
        scope: authorizationParams?.scope ?? scope,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0ProviderBase>
  );
};

export default Auth0Provider;
