import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthPortalPageComponent } from './features/auth/pages/auth-portal-page/auth-portal-page.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';

export const appRoutes: Routes = [
  { path: '', component: AuthPortalPageComponent },
  { path: 'dashboard', component: DashboardComponent },
  {path: 'home', component: HomePageComponent}
];