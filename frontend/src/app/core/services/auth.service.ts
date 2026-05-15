import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: Replace with real auth flow — set this after login API call
  private readonly token = signal<string | null>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWY1ZDdmZjVmNmI1M2E0Mzk0NDZhZWYiLCJpYXQiOjE3Nzg3NzYzNDQsImV4cCI6MTc3OTM4MTE0NH0.Wdgvu0CrOTi6kj2enTcuOBNrBm49XqpgtK15BhjHGbo'
  );

  getToken(): string | null {
    return this.token();
  }

  setToken(token: string): void {
    this.token.set(token);
  }

  clearToken(): void {
    this.token.set(null);
  }
}
