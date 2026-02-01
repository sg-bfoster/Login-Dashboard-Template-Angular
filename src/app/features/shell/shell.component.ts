import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentYear = new Date().getFullYear();
  protected readonly sidebarOpen = signal(false);
  private sub?: Subscription;

  constructor() {
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarOpen.set(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } finally {
      // Always navigate to /login so we don't remain on a protected route if the provider's
      // logout redirect is blocked/misconfigured.
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
