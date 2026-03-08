import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthPortalPageComponent } from './features/auth/pages/auth-portal-page/auth-portal-page.component';

export const appRoutes: Routes = [
  { path: '', component: AuthPortalPageComponent },
  { path: 'dashboard', component: DashboardComponent }
];