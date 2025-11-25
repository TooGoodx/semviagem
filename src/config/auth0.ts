const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || (
  typeof window !== 'undefined'
    ? `${window.location.origin}/area-logada`
    : 'https://extraordinary-starship-9103ce.netlify.app/area-logada'
);

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-j184kb6qzqv5nkd8.us.auth0.com';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'SfN7paQtf9vBWAh21GEhCN7vVClmxxV8';
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`;

export const auth0Config = {
  domain: auth0Domain,
  clientId: auth0ClientId,
  authorizationParams: {
    redirect_uri: redirectUri,
    audience: auth0Audience,
    scope: 'openid profile email offline_access',
  },
};

export const AUTH0_CONFIG = auth0Config;

// Debug log to verify correct configuration is loaded
console.log('🔐 Auth0 Configuration Loaded:', {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirectUri: auth0Config.authorizationParams.redirect_uri,
  audience: auth0Config.authorizationParams.audience,
});
