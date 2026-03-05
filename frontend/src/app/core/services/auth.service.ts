import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, switchMap, map, shareReplay } from 'rxjs';

interface RolesApiResponse {
  success?: boolean;
  data?: { roles?: string[] };
}
import { environment } from '../../../environments/environment';

const REFRESH_KEY = 'refreshToken';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role?: unknown;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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
    map((res) => res.data?.roles ?? []),
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
    const raw = this.storage?.getItem('user');
    if (raw) try { this.userSubject.next(JSON.parse(raw)); } catch { /* ignore */ }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  login(email: string, password: string): Observable<{ user: User }> {
    return this.http.post<{ success?: boolean; data?: LoginResponse } & LoginResponse>(
      `${environment.apiUrl}/api/auth/login`,
      { email, password }
    ).pipe(
      tap((res) => {
        const data = res.data ?? res;
        const at = data.accessToken;
        const rt = data.refreshToken;
        const user = data.user;
        if (at && rt && user && this.storage) {
          this.accessToken = at;
          this.storage.setItem(REFRESH_KEY, rt);
          this.storage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
      }),
      switchMap((res) => {
        const data = res.data ?? res;
        return of({ user: data.user });
      }),
      catchError((err) => {
        throw err;
      })
    );
  }

  register(payload: { email: string; password: string; firstName: string; lastName: string; roleName: string }): Observable<{ user: User }> {
    return this.http.post<{ success?: boolean; data?: LoginResponse } & LoginResponse>(
      `${environment.apiUrl}/api/auth/register`,
      payload
    ).pipe(
      tap((res) => {
        const data = res.data ?? res;
        const at = data.accessToken;
        const rt = data.refreshToken;
        const user = data.user;
        if (at && rt && user && this.storage) {
          this.accessToken = at;
          this.storage.setItem(REFRESH_KEY, rt);
          this.storage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
      }),
      switchMap((res) => {
        const data = res.data ?? res;
        return of({ user: data.user });
      }),
      catchError((err) => {
        throw err;
      })
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
    this.storage?.removeItem(REFRESH_KEY);
    this.storage?.removeItem('user');
    this.router.navigate(['/login']);
  }

  refreshAccessToken(): Observable<string> {
    const refresh = this.storage?.getItem(REFRESH_KEY);
    if (!refresh) return of('').pipe(tap(() => this.clearAndRedirect()));

    return this.http.post<{ data?: { accessToken?: string }; accessToken?: string }>(
      `${environment.apiUrl}/api/auth/refresh-token`,
      { refreshToken: refresh }
    ).pipe(
      tap((res) => {
        const at = res.data?.accessToken ?? res.accessToken;
        if (at) this.accessToken = at;
      }),
      switchMap((res) => {
        const at = res.data?.accessToken ?? res.accessToken;
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
    this.storage?.removeItem(REFRESH_KEY);
    this.storage?.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  tryRestoreSession(): Promise<void> {
    if (this.accessToken) return Promise.resolve();
    const refresh = this.storage?.getItem(REFRESH_KEY);
    if (!refresh) return Promise.resolve();

    return new Promise((resolve) => {
      this.refreshAccessToken().subscribe({
        next: (token) => { resolve(); },
        error: () => { resolve(); }
      });
    });
  }
}
