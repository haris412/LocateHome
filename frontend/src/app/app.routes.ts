import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';

export const appRoutes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
];