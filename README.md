# AngularApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0. It includes a minimal business login template with **Supabase Auth** and a dashboard shell (fixed title bar, fixed sidebar on desktop, collapsible sidebar with hamburger on mobile).

## Quick start (use as template)

1. **Use this repo as a template** on GitHub (use "Use this template" → "Create a new repository") or clone it.
2. **Install and run:**
   ```bash
   npm install
   npm start
   ```
   The app builds and serves at `http://localhost:4200/`. Login will not work until you add Supabase credentials.
3. **Add Supabase credentials:** copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (from [Supabase](https://supabase.com) → your project → **Settings → API**). Then run `npm start` again.

**Node:** Use Node 20.19+ or 22.12+ (see `.nvmrc`).

**Troubleshooting:** If you see `Cannot find module @rollup/rollup-darwin-arm64` (or similar `@rollup/rollup-*`) on `npm start`, it is caused by an [npm bug](https://github.com/npm/cli/issues/4828) with optional dependencies. Try: `rm -rf node_modules package-lock.json && npm install`, then `npm start` again.

**To offer this as a template:** In your GitHub repo → **Settings** → check **Template repository**.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. In the dashboard: **Settings → API** — copy **Project URL** and the **anon public** key.
3. In **Authentication → Providers**, ensure **Email** is enabled.
4. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

`supabase.config.ts` is committed with blank values. It is **overwritten at build time** from `.env` (or from `SUPABASE_URL` / `SUPABASE_ANON_KEY`). Use `npm start` and `npm run build` so the generate step runs. Do not commit `.env`; it is in `.gitignore`. To restore the blank before committing: `npm run config:blank`. Do not commit when it contains real credentials; `npm run check:pre-publish` will fail if that file is staged with them.

**Heroku:** Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Config Vars. The build runs the generate script before `ng build`, so the app gets your credentials from the environment.

**Note:** The free tier may pause projects after 1 week of inactivity; you can restore from the Supabase dashboard.

## Development server

Run `npm start` (or `ng serve`). The generate script runs first and overwrites `supabase.config.ts` from `.env`. Open `http://localhost:4200/`; the app reloads when you change source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

Run `npm run build` (or `ng build`). The generate script runs first and overwrites `supabase.config.ts` from `.env` (or env vars). Output is in `dist/`.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
