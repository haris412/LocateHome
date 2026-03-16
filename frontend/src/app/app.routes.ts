import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthPortalPageComponent } from './features/auth/pages/auth-portal-page/auth-portal-page.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { authGuard } from './core/guards/auth.guard';
import { ListingsPageComponent } from './features/listings/pages/listings-page/listings-page.component';

export const appRoutes: Routes = [
  { path: 'login', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'auth', component: AuthPortalPageComponent },
  { path: 'listings', component: ListingsPageComponent }
];