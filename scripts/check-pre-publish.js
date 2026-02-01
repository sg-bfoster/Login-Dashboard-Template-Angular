'use strict';

const { execSync } = require('child_process');

function run(cmd, silent = true) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch {
    return null;
  }
}

if (!run('git rev-parse --is-inside-work-tree')) {
  console.log('Not a git repo; skipping check.');
  process.exit(0);
}

// git check-ignore -q .env exits 0 when .env is ignored, 1 when not
if (run('git check-ignore -q .env') === null) {
  console.error('ERROR: .env is not ignored. Do not commit it.');
  process.exit(1);
}

// If supabase.config.ts is staged, ensure it does not contain real credentials
const staged = run('git diff --cached --name-only') || '';
if (staged.includes('src/app/core/config/supabase.config.ts')) {
  let content = '';
  try {
    content = run('git show :src/app/core/config/supabase.config.ts') || '';
  } catch {}
  if (/sb_[a-zA-Z0-9_]{10,}/.test(content) || /anonKey:\s*["'][^"']{20,}["']/.test(content)) {
    console.error('ERROR: supabase.config.ts is staged with what looks like real credentials. Unstage: git restore --staged src/app/core/config/supabase.config.ts');
    process.exit(1);
  }
}

// If auth.config.ts is staged, ensure it stays blank (template invariant)
if (staged.includes('src/app/core/config/auth.config.ts')) {
  let content = '';
  try {
    content = run('git show :src/app/core/config/auth.config.ts') || '';
  } catch {}
  if (/issuer:\s*["'][^"']+["']/.test(content) || /clientId:\s*["'][^"']+["']/.test(content)) {
    console.error('ERROR: auth.config.ts is staged with non-blank Okta values. Run: npm run config:blank');
    process.exit(1);
  }
}

console.log('check:pre-publish passed.');
