// Overwritten from .env (or env vars) at build time. Committed blank so the project builds before .env is set.
export type AuthProviderName = 'supabase' | 'okta';

export const authConfig: {
  authProvider: AuthProviderName;
  okta: {
    issuer: string;
    clientId: string;
  };
} = {
  authProvider: 'supabase',
  okta: {
    issuer: '',
    clientId: '',
  },
};
