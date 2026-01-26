# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 20 SPA template with Supabase authentication, featuring a dashboard shell with responsive sidebar navigation.

## Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server at http://localhost:4200 (auto-checks native binaries, generates Supabase config) |
| `npm run build` | Production build to /dist (auto-checks native binaries, generates Supabase config) |
| `npm test` | Run unit tests via Karma |
| `npm run fix:native` | Manually fix esbuild/Rollup architecture mismatch |
| `npm run config:blank` | Clear credentials from supabase.config.ts before committing |
| `npm run check:pre-publish` | Verify no real credentials in config before pushing |

**Requirements:** Node 20.19+ (run `nvm use` before npm install)

## Architecture

### Tech Stack
- Angular 20 with standalone components (no NgModules)
- Supabase Auth for authentication
- Angular Signals for state management
- SCSS for styling
- TypeScript strict mode

### Directory Structure
```
src/app/
├── core/                    # Singletons: services, guards, config
│   ├── config/              # supabase.config.ts (generated at build)
│   ├── services/            # AuthService, SupabaseService
│   └── guards/              # authGuard (CanActivateFn)
├── features/                # Lazy-loaded feature components
│   ├── auth/login/          # Public login page
│   ├── shell/               # Main layout with sidebar
│   ├── dashboard/           # Protected dashboard
│   └── about/               # Protected about page
├── app.routes.ts            # Route definitions
├── app.config.ts            # DI providers + APP_INITIALIZER
└── app.ts                   # Root component
```

### Key Patterns

**Authentication Flow:**
- `AuthService` uses Angular Signals (`user` signal, `isAuthenticated` computed)
- `initialize()` runs via APP_INITIALIZER at bootstrap to restore Supabase session
- `authGuard` protects routes, redirects unauthenticated users to `/login` with returnUrl

**Routing:**
- `/login` - Public, lazy-loaded
- `/` - Protected shell with children (dashboard, about)
- All feature components use `loadComponent()` for lazy loading

**Config Generation:**
- `supabase.config.ts` is committed with blank values
- `prestart`/`prebuild` hooks generate real config from `.env` or environment variables
- Always run `npm run config:blank` before committing

**Native Binary Handling:**
- esbuild and Rollup use platform-specific binaries (e.g., `@esbuild/darwin-arm64`)
- `prestart`/`prebuild`/`pretest` hooks auto-detect and install correct binaries for current Node architecture
- Fixes architecture mismatch when switching between Node versions (x64 Rosetta vs arm64 native on Mac)

### Adding New Features

1. Create component in `src/app/features/` using `ng generate component features/feature-name`
2. Add route in `app.routes.ts` under ShellComponent children for protected routes
3. Use `standalone: true` and import only what the component needs
