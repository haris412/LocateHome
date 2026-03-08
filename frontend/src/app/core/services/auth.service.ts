import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, switchMap, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

interface RolesApiResponse {
  success?: boolean;
  data?: { roles?: string[] };
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName: string;
}

interface AuthApiResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface VerifyEmailRequestBody {
  token: string;
  email?: string;
}

interface VerifyEmailResponse {
  success?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private accessToken: string | null = null;
  private userSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.userSubject.asObservable();

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  /** Public API, no auth. Cached with shareReplay(1). Never errors – returns [] on failure. */
  private roles$ = this.http.get<RolesApiResponse>(`${environment.apiUrl}/api/auth/roles`).pipe(
    map((response) => response.data?.roles ?? []),
    catchError(() => of([])),
    shareReplay(1)
  );

  getRoles(): Observable<string[]> {
    return this.roles$;
  }

  constructor() {
    const stored = this.storage?.getItem(REFRESH_KEY);
    if (stored) this.loadStoredUser();
    // Do NOT subscribe to roles$ here: it would trigger HTTP → interceptor → inject(AuthService) → circular DI
  }

  private loadStoredUser(): void {
    const raw = this.storage?.getItem(USER_KEY);
    if (raw) try { this.userSubject.next(JSON.parse(raw)); } catch { /* ignore */ }
  }

  private storeAuthData(data: AuthApiResponse): void {
    if (!this.storage || !data.accessToken || !data.refreshToken || !data.user) return;
    this.accessToken = data.accessToken;
    this.storage.setItem(REFRESH_KEY, data.refreshToken);
    this.storage.setItem(USER_KEY, JSON.stringify(data.user));
    this.userSubject.next(data.user);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  login(payload: LoginPayload): Observable<{ user: User }> {
    return this.http.post<{ success?: boolean; data?: AuthApiResponse } & AuthApiResponse>(
      `${environment.apiUrl}/api/auth/login`,
      payload
    ).pipe(
      tap((response) => this.storeAuthData(response.data ?? response)),
      switchMap((response) => of({ user: (response.data ?? response).user }))
    );
  }

  /**
   * Registers a new user. Does NOT log the user in; caller should redirect to login with a message.
   * Backend response: { success, data: { user, accessToken, refreshToken } } or flat { user, accessToken, refreshToken }.
   */
  register(payload: RegisterPayload): Observable<{ user: User }> {
    return this.http.post<{ success?: boolean; data?: AuthApiResponse } & AuthApiResponse>(
      `${environment.apiUrl}/api/auth/register`,
      payload
    ).pipe(
      map((response) => ({ user: (response.data ?? response).user }))
    );
  }

  logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({ error: () => {} });
    }
    this.accessToken = null;
    this.userSubject.next(null);
    this.storage?.clear();
    this.router.navigate(['/login']);
  }

  refreshAccessToken(): Observable<string> {
    const refresh = this.storage?.getItem(REFRESH_KEY);
    if (!refresh) return of('').pipe(tap(() => this.clearAndRedirect()));

    return this.http.post<{ data?: { accessToken?: string }; accessToken?: string }>(
      `${environment.apiUrl}/api/auth/refresh-token`,
      { refreshToken: refresh }
    ).pipe(
      tap((response) => {
        const at = response.data?.accessToken ?? response.accessToken;
        if (at) this.accessToken = at;
      }),
      switchMap((response) => {
        const at = response.data?.accessToken ?? response.accessToken;
        if (at) return of(at);
        this.clearAndRedirect();
        return of('');
      }),
      catchError(() => {
        this.clearAndRedirect();
        return of('');
      })
    );
  }

  private clearAndRedirect(): void {
    this.accessToken = null;
    this.userSubject.next(null);
    this.storage?.clear();
    this.router.navigate(['/login']);
  }

  /**
   * Verifies email using the token (and optional email) from the verification link.
   * POST body only; token is never sent in the request URL.
   * Including email allows the backend to return "already verified" on refresh or double submit.
   */
  verifyEmail(
    token: string,
    email?: string | null
  ): Observable<{ success: boolean }> {
    const body: VerifyEmailRequestBody = email?.trim()
      ? { token, email: email.trim() }
      : { token };
    return this.http
      .post<VerifyEmailResponse>(
        `${environment.apiUrl}/api/auth/verify-email`,
        body
      )
      .pipe(map((res) => ({ success: res.success ?? true })));
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  tryRestoreSession(): Promise<void> {
    if (this.accessToken) return Promise.resolve();
    const refresh = this.storage?.getItem(REFRESH_KEY);
    if (!refresh) return Promise.resolve();

    return new Promise((resolve) => {
      this.refreshAccessToken().subscribe({ next: () => resolve(), error: () => resolve() });
    });
  }
}
