import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p>You are logged in.</p>
      <button type="button" class="btn-logout" (click)="auth.logout()">Log out</button>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; text-align: center; }
    .btn-logout { margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer; }
  `]
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}
