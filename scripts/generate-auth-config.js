'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const authProvider = (process.env.AUTH_PROVIDER || 'supabase').toLowerCase();
const oktaIssuer = process.env.OKTA_ISSUER || '';
const oktaClientId = process.env.OKTA_CLIENT_ID || '';

const normalizedProvider = authProvider === 'okta' ? 'okta' : 'supabase';

const outPath = path.join(__dirname, '../src/app/core/config/auth.config.ts');
const content = `// Overwritten from .env (or env vars) at build time. Do not edit.
export type AuthProviderName = 'supabase' | 'okta';

export const authConfig: {
  authProvider: AuthProviderName;
  okta: {
    issuer: string;
    clientId: string;
  };
} = {
  authProvider: ${JSON.stringify(normalizedProvider)},
  okta: {
    issuer: ${JSON.stringify(oktaIssuer)},
    clientId: ${JSON.stringify(oktaClientId)},
  },
};
`;

fs.writeFileSync(outPath, content, 'utf8');

