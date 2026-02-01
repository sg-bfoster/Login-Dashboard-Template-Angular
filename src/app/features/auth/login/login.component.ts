import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { authConfig } from '../../../core/config/auth.config';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly providerName = this.auth.providerName;
  protected readonly oktaWidgetLoading = signal(false);

  private signInWidget?: { remove: () => void };

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
      this.router.navigate([returnUrl || '/']);
      return;
    }

    if (this.providerName === 'okta') {
      void this.renderOktaWidget();
    }
  }

  ngOnDestroy(): void {
    this.signInWidget?.remove?.();
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);
    if (error) {
      this.errorMessage.set(error.message);
      return;
    }
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
    this.router.navigate([returnUrl || '/']);
  }

  private async renderOktaWidget(): Promise<void> {
    this.errorMessage.set(null);
    this.oktaWidgetLoading.set(true);

    const oktaAuth = this.auth.getOktaAuthClientOrNull();
    if (!oktaAuth) {
      this.errorMessage.set('Okta is not enabled for this app.');
      this.oktaWidgetLoading.set(false);
      return;
    }

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
    this.auth.saveReturnUrl(returnUrl || '/');

    try {
      const mod: any = await import('@okta/okta-signin-widget');
      const OktaSignIn = mod?.default ?? mod;

      const issuer = authConfig.okta.issuer;
      const clientId = authConfig.okta.clientId;
      const redirectUri = window.location.origin + '/login/callback';

      const widget: any = new OktaSignIn({
        baseUrl: issuer.split('/oauth2')[0],
        clientId,
        redirectUri,
        authClient: oktaAuth,
      });
      this.signInWidget = widget;
      widget.on?.('ready', () => this.oktaWidgetLoading.set(false));

      const url = new URL(window.location.href);
      widget.otp = url.searchParams.get('otp');
      widget.state = url.searchParams.get('state');

      const tokens = await widget.showSignInToGetTokens({
        el: '#sign-in-widget',
        scopes: ['openid', 'profile', 'email', 'offline_access'],
      });

      widget.remove();
      await oktaAuth.handleLoginRedirect(tokens);

      // In embedded-widget flows, restoreOriginalUri may not always navigate as expected
      // across all org configurations. Ensure we route to the intended page.
      await this.auth.initialize();
      const afterLoginReturnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
      await this.router.navigateByUrl(afterLoginReturnUrl || '/');
    } catch (e: any) {
      this.oktaWidgetLoading.set(false);
      const msg = typeof e?.message === 'string' ? e.message : 'Okta sign-in failed.';
      this.errorMessage.set(msg);
    }
  }
}
