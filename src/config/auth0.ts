const redirectUri =
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://extraordinary-starship-9103ce.netlify.app/auth/callback';

// Auth0 configuration using environment variables
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-jbjzcnwlhqzgtcpp.us.auth0.com';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'n3Q1wYJ3jAVdmLEy1QX2MvH3S88Jg1Sw';
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`;

export const auth0Config = {
  domain: auth0Domain,
  clientId: auth0ClientId,
  redirectUri,
  audience: auth0Audience,
  scope: 'openid profile email',
  authorizationParams: {
    redirect_uri: redirectUri,
    audience: auth0Audience,
    scope: 'openid profile email',
  },
};

// Exportar também como AUTH0_CONFIG para compatibilidade
export const AUTH0_CONFIG = auth0Config;
