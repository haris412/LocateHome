import {
  Component,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export type VerifyState =
  | 'loading'
  | 'success'
  | 'error'
  | 'missing_params';

const ERROR_MESSAGE_MAX_LENGTH = 500;
const REDIRECT_DELAY_MS = 3000;

interface VerificationParams {
  token: string | null;
  email: string | null;
}

/**
 * Reads token and email from the verification URL.
 * Uses raw query string in browser so '+' in token is not decoded as space.
 */
function getVerificationParams(
  route: ActivatedRoute,
  isBrowser: boolean
): VerificationParams {
  const fromSnapshot = (): VerificationParams => ({
    token: route.snapshot.queryParamMap.get('token')?.trim() ?? null,
    email: route.snapshot.queryParamMap.get('email')?.trim() ?? null,
  });

  if (!isBrowser || typeof window === 'undefined' || !window.location?.search) {
    return fromSnapshot();
  }

  const search = window.location.search;
  const tokenMatch = search.match(/[?&]token=([^&]*)/);
  const emailMatch = search.match(/[?&]email=([^&]*)/);

  const decode = (raw: string): string => {
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  };

  return {
    token: tokenMatch ? decode(tokenMatch[1]) || null : null,
    email: emailMatch ? decode(emailMatch[1]) || null : null,
  };
}

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnDestroy {
  state: VerifyState = 'loading';
  errorMessage = '';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  private subscription: Subscription | null = null;
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private requestSent = false;

  ngOnInit(): void {
    if (this.requestSent) return;

    const { token, email } = getVerificationParams(
      this.route,
      isPlatformBrowser(this.platformId)
    );

    if (!token) {
      this.state = 'missing_params';
      this.errorMessage = 'Invalid verification link. Please use the link from your email.';
      return;
    }

    this.requestSent = true;
    this.subscription = this.auth
      .verifyEmail(token, email)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.state = 'success';
          this.scheduleRedirect();
        },
        error: (err) => {
          this.state = 'error';
          this.errorMessage = this.normalizeErrorMessage(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.redirectTimeoutId != null) {
      clearTimeout(this.redirectTimeoutId);
      this.redirectTimeoutId = null;
    }
  }

  goToLogin(): void {
    const queryParams = this.state === 'success' ? { verified: 'true' } : {};
    this.router.navigate(['/login'], { queryParams });
  }

  private normalizeErrorMessage(err: unknown): string {
    const fallback =
      'This link is invalid or has expired. Please request a new verification email.';
    if (err == null || typeof err !== 'object') return fallback;

    const msg =
      (err as { error?: { message?: string }; message?: string }).error
        ?.message ??
      (err as { message?: string }).message;
    if (typeof msg !== 'string' || !msg) return fallback;

    const safe = msg.slice(0, ERROR_MESSAGE_MAX_LENGTH);
    return safe.length < msg.length ? `${safe}…` : safe;
  }

  private scheduleRedirect(): void {
    this.redirectTimeoutId = setTimeout(() => {
      this.redirectTimeoutId = null;
      this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
    }, REDIRECT_DELAY_MS);
  }
}
