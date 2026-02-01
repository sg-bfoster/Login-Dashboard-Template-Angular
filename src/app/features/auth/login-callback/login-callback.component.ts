import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-callback',
  standalone: true,
  template: `
    <div style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
      <p>{{ message() }}</p>
    </div>
  `,
})
export class LoginCallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly message = signal('Signing you in…');

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.handleLoginCallback();
      if (this.auth.isAuthenticated()) {
        // Okta will typically navigate via restoreOriginalUri; this is a safe fallback.
        await this.router.navigateByUrl('/');
      } else {
        await this.router.navigateByUrl('/login');
      }
    } catch (e: any) {
      this.message.set(typeof e?.message === 'string' ? e.message : 'Sign-in failed.');
      setTimeout(() => void this.router.navigateByUrl('/login'), 1000);
    }
  }
}

