import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome.</p>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; text-align: center; }
  `]
})
export class DashboardComponent {
}
