# Security scan report (pre–public GitHub)

**Date:** 2025-01-24  
**Scope:** Secrets, credentials, `.gitignore`, dependencies.

---

## 1. Secrets and credentials

### Must stay out of the repo

| File | Status | Notes |
|------|--------|-------|
| `.env` | In `.gitignore` | Contains `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Do not commit. |

### Committed with blank; overwritten at build

| File | Notes |
|------|-------|
| `src/app/core/config/supabase.config.ts` | Committed with `url: ''` and `anonKey: ''`. Overwritten from `.env` (or `SUPABASE_URL` / `SUPABASE_ANON_KEY`) when you run `npm start` or `npm run build`. Do not commit this file when it contains real credentials; run `npm run check:pre-publish` before pushing. |

### Safe to commit

- `supabase.config.example.ts` – shape reference only.
- `.env.example` – placeholders only (`SUPABASE_URL=`, `SUPABASE_ANON_KEY=`).

---

## 2. .gitignore

Relevant lines:

```
.env
.env.local
src/app/core/config/supabase.config.local.ts
```

`.env` is ignored. `supabase.config.ts` is **not** ignored so it can be committed with blank values.

---

## 3. Dependencies

- `npm audit`: **0 vulnerabilities** (as of this scan).

---

## 4. Other checks

- No `console.log` (or similar) of passwords, tokens, or secrets in `src/`.
- `.vscode/launch.json` – no env vars or credentials.
- `scripts/generate-supabase-config.js` – reads `process.env` after `dotenv`; no hardcoded secrets.
- `node_modules` – ignored.

---

## 5. Before you push (checklist)

1. **Ensure `.env` is ignored**  
   - `git status` should not show `.env`.

2. **If you changed `supabase.config.ts`**  
   - It is overwritten from `.env` at build. Do not commit it when it contains real credentials.  
   - Run `npm run check:pre-publish`; it fails if `supabase.config.ts` is staged with credential-like content.  
   - To restore the blank: `npm run config:blank` or `git checkout -- src/app/core/config/supabase.config.ts` (then run `npm start` or `npm run build` to regenerate from `.env`).

3. **If the repo has history**  
   - Check that `.env` and `supabase.config.ts` with real keys were never committed, e.g.  
     `git log -p -S "sb_publishable_" --all -- .`  
   - If they appear, remove from history and rotate the anon key in Supabase.

4. **After publishing**  
   - If the anon key was ever committed, rotate it in Supabase: **Settings → API** → regenerate, then update `.env` and regenerate the config.

---

## 6. Anon key in the frontend

The **anon (public) key** is intended for the browser and is restricted by Supabase RLS and auth. It appears in the built JS; that is expected.  
Never commit the **service_role** key or the **database password**; keep them server-side only.

---

## 7. Heroku

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Config Vars. The build runs `prebuild` (generate script) before `ng build`, so the app gets values from the environment. Use `npm run build` as the build command.

---

## Summary

- `.env` is gitignored; it holds your Supabase credentials locally.  
- `supabase.config.ts` is committed blank and overwritten from `.env` (or env vars) at build. Do not commit it when it contains real values.  
- `npm run check:pre-publish` helps avoid committing credentials in `supabase.config.ts`.  
- `npm audit` is clean.
