'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

const outPath = path.join(__dirname, '../src/app/core/config/supabase.config.ts');
const content = `// Overwritten from .env (or SUPABASE_URL / SUPABASE_ANON_KEY) at build time. Do not edit.
export const supabaseConfig = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;

fs.writeFileSync(outPath, content, 'utf8');
