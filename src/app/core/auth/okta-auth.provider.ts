import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { authConfig } from '../config/auth.config';
import type { AuthProvider, AuthUser } from './auth-provider';

@Injectable({ providedIn: 'root' })
export class OktaAuthProvider implements AuthProvider {
  readonly name = 'okta' as const;

  private readonly router = inject(Router);

  private oktaAuth?: OktaAuth;
  private subscribed = false;

  private readonly _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();
  private readonly _isAuthenticated = signal(false);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  get client(): OktaAuth {
    if (this.oktaAuth) return this.oktaAuth;

    const issuer = authConfig.okta.issuer;
    const clientId = authConfig.okta.clientId;
    if (!issuer || !clientId) {
      throw new Error(
        'Okta is selected but OKTA_ISSUER/OKTA_CLIENT_ID are not configured. Set them in .env and restart.'
      );
    }

    this.oktaAuth = new OktaAuth({
      issuer,
      clientId,
      redirectUri: window.location.origin + '/login/callback',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      restoreOriginalUri: async (_oktaAuth, originalUri) => {
        const relative = toRelativeUrl(originalUri || '/', window.location.origin);
        await this.router.navigateByUrl(relative);
      },
    });

    return this.oktaAuth;
  }

  async initialize(): Promise<void> {
    const oktaAuth = this.client;

    if (!this.subscribed) {
      this.subscribed = true;
      oktaAuth.authStateManager.subscribe(() => {
        this.syncFromAuthState();
      });
    }

    await oktaAuth.authStateManager.updateAuthState();
    this.syncFromAuthState();
  }

  saveReturnUrl(url: string): void {
    const oktaAuth = this.client;
    const absolute = new URL(url, window.location.origin).href;
    oktaAuth.setOriginalUri(absolute);
  }

  async handleLoginCallback(): Promise<void> {
    const oktaAuth = this.client;
    if (oktaAuth.isLoginRedirect()) {
      await oktaAuth.handleLoginRedirect();
    }
    await oktaAuth.authStateManager.updateAuthState();
    this.syncFromAuthState();
  }

  async signOut(): Promise<void> {
    const oktaAuth = this.client;
    // Clear local app state immediately (in case logout redirect fails).
    this._user.set(null);
    this._isAuthenticated.set(false);

    // Clear local tokens immediately (in case the browser navigates before the promise resolves).
    // `clearTokensBeforeRedirect` should also do this, but being explicit makes the flow more reliable.
    oktaAuth.tokenManager.clear();
    await oktaAuth.authStateManager.updateAuthState();

    // Force a full Okta logout flow. Use origin (/) as the post-logout redirect since it’s the
    // most commonly configured Okta logout URI; the auth guard will route to /login if needed.
    await oktaAuth.signOut({
      postLogoutRedirectUri: window.location.origin,
      clearTokensBeforeRedirect: true,
      revokeAccessToken: true,
      revokeRefreshToken: true,
    });
  }

  private syncFromAuthState(): void {
    const oktaAuth = this.client;
    const authState = oktaAuth.authStateManager.getAuthState();
    const isAuth = !!authState?.isAuthenticated;
    this._isAuthenticated.set(isAuth);
    if (!isAuth) {
      this._user.set(null);
      return;
    }

    // Avoid /userinfo calls (which can 401 on stale/revoked tokens). Use ID token claims instead.
    const claims: any = authState?.idToken?.claims ?? {};
    const email =
      (typeof claims.email === 'string' && claims.email) ||
      (typeof claims.preferred_username === 'string' && claims.preferred_username) ||
      null;
    this._user.set({ email });
  }
}

