'use strict';

const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '../src/app/core/config/auth.config.ts');
const content = `// Overwritten from .env (or env vars) at build time. Committed blank so the project builds before .env is set.
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
`;

fs.writeFileSync(outPath, content, 'utf8');

