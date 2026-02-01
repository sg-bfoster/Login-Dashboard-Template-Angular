import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import type { AuthProvider, AuthUser, PasswordSignInResult } from './auth-provider';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthProvider implements AuthProvider {
  readonly name = 'supabase' as const;

  private readonly supabase = inject(SupabaseService);

  private readonly _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());

  async initialize(): Promise<void> {
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();
    this._user.set(session?.user ? { email: session.user.email ?? null } : null);

    this.supabase.client.auth.onAuthStateChange((_event, newSession) => {
      this._user.set(newSession?.user ? { email: newSession.user.email ?? null } : null);
    });
  }

  async signInWithPassword(email: string, password: string): Promise<PasswordSignInResult> {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    return { error: error ? { message: error.message } : null };
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this._user.set(null);
  }
}

