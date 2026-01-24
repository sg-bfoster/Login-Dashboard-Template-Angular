'use strict';

const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '../src/app/core/config/supabase.config.ts');
const content = `// Overwritten from .env (or SUPABASE_URL / SUPABASE_ANON_KEY) at build time. Committed blank so the project builds before .env is set.
export const supabaseConfig = {
  url: '',
  anonKey: '',
};
`;

fs.writeFileSync(outPath, content, 'utf8');
