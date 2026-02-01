import { Injectable, Injector, computed, inject } from '@angular/core';
import { authConfig } from '../config/auth.config';
import { OktaAuthProvider } from '../auth/okta-auth.provider';
import { SupabaseAuthProvider } from '../auth/supabase-auth.provider';
import type { AuthProvider, AuthProviderName, PasswordSignInResult } from '../auth/auth-provider';
import type { OktaAuth } from '@okta/okta-auth-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly injector = inject(Injector);

  readonly providerName: AuthProviderName = authConfig.authProvider;

  // Important: do NOT eagerly inject both providers, or we instantiate Supabase even in Okta mode.
  private readonly provider: AuthProvider =
    this.providerName === 'okta'
      ? this.injector.get(OktaAuthProvider)
      : this.injector.get(SupabaseAuthProvider);

  readonly user = computed(() => this.provider.user());
  readonly isAuthenticated = computed(() => this.provider.isAuthenticated());

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  saveReturnUrl(url: string): void {
    this.provider.saveReturnUrl?.(url);
  }

  async signIn(email: string, password: string): Promise<PasswordSignInResult> {
    if (!this.provider.signInWithPassword) {
      return { error: { message: 'Password sign-in is not enabled for the configured auth provider.' } };
    }
    return this.provider.signInWithPassword(email, password);
  }

  async handleLoginCallback(): Promise<void> {
    await this.provider.handleLoginCallback?.();
  }

  getOktaAuthClientOrNull(): OktaAuth | null {
    if (this.providerName !== 'okta') return null;
    try {
      return (this.provider as OktaAuthProvider).client;
    } catch {
      return null;
    }
  }

  async signOut(): Promise<void> {
    await this.provider.signOut();
  }
}
