import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthPortalPageComponent } from './features/auth/pages/auth-portal-page/auth-portal-page.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: AuthPortalPageComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];