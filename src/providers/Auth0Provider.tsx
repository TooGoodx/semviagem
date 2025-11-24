import React from 'react';
import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { AUTH0_CONFIG } from '../config/auth0';

interface Auth0ProviderProps {
  children: React.ReactNode;
}

const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children }) => {
  return (
    <Auth0ProviderBase
      domain={AUTH0_CONFIG.domain}
      clientId={AUTH0_CONFIG.clientId}
      authorizationParams={AUTH0_CONFIG.authorizationParams}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0ProviderBase>
  );
};

export default Auth0Provider;
