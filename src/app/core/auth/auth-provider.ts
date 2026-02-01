import type { Signal } from '@angular/core';

export type AuthProviderName = 'supabase' | 'okta';

export type AuthUser = {
  email: string | null;
};

export type PasswordSignInResult = {
  error: { message: string } | null;
};

export interface AuthProvider {
  readonly name: AuthProviderName;
  readonly user: Signal<AuthUser | null>;
  readonly isAuthenticated: Signal<boolean>;

  initialize(): Promise<void>;
  signOut(): Promise<void>;

  // Supabase-only (email/password)
  signInWithPassword?(email: string, password: string): Promise<PasswordSignInResult>;

  // Okta-only (better returnUrl reliability across redirects)
  saveReturnUrl?(url: string): void;
  handleLoginCallback?(): Promise<void>;
}

