import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { AgentsPageComponent } from './features/agents/pages/agents-page/agents-page.component';
import { ContactPageComponent } from './features/contact/pages/contact-page/contact-page.component';
import { PrivacyPolicyPageComponent } from './features/privacy-policy/pages/privacy-policy-page/privacy-policy-page.component';
import { ReportIssuePageComponent } from './features/report-issue/pages/report-issue-page/report-issue-page.component';

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
  },
  {
    path: 'agents',
    component: AgentsPageComponent
  },
  {
    path: 'contact',
    component: ContactPageComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyPageComponent
  },
  {
    path: 'report-issue',
    component: ReportIssuePageComponent
  }
];