import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: Replace with real auth flow — set this after login API call
  private readonly token = signal<string | null>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQ5NzEyNjdjNjZlZTgwZGYxOGJhMTciLCJlbWFpbCI6ImFsaUBleGFtcGxlLmNvbSIsImlhdCI6MTc3NTg1Nzk2MiwiZXhwIjoxNzc2MTE3MTYyfQ.DdPilNsci0c42NgUfEArZlTPqyb1o0Qk45gEY7Z7Ois'
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
