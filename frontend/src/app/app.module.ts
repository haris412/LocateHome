import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthService } from './core/services/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { BrandLogoComponent } from './shared/ui/brand-logo/brand-logo.component';
import { StatCardComponent } from './shared/ui/stat-card/stat-card.component';
import { FeatureCardComponent } from './shared/ui/feature-card/feature-card.component';
import { SocialButtonComponent } from './shared/ui/social-button/social-button.component';
import { SegmentedTabsComponent } from './shared/ui/segmented-tabs/segmented-tabs.component';
import { AuthPortalPageComponent } from './features/auth/pages/auth-portal-page/auth-portal-page.component';
import { AuthHeroPanelComponent } from './features/auth/components/auth-hero-panel/auth-hero-panel.component';
import { SignupCardComponent } from './features/auth/components/signup-card/signup-card.component';
import { LoginCardComponent } from './features/auth/components/login-card/login-card.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [AppComponent, LoginComponent, DashboardComponent, BrandLogoComponent, StatCardComponent, FeatureCardComponent, SocialButtonComponent, SegmentedTabsComponent, AuthPortalPageComponent, AuthHeroPanelComponent, SignupCardComponent, LoginCardComponent],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.tryRestoreSession(),
      deps: [AuthService],
      multi: true
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
