import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';

export const appRoutes: Routes = [
  { path: 'home', component: HomePageComponent },

  // { path: 'verify-email', component: VerifyEmailComponent },

  // { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // { path: 'auth', component: AuthPortalPageComponent },

  {
    path: 'listings',
    loadChildren: () =>
      import('./features/listings/listings.routes')
        .then(m => m.LISTINGS_ROUTES)
  }
];