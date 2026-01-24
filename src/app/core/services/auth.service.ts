import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());

  async initialize(): Promise<void> {
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();
    this.user.set(session?.user ?? null);
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.client.auth.signOut();
  }
}
