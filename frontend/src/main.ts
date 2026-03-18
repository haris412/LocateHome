import { bootstrapApplication } from '@angular/platform-browser';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { AuthService } from './app/core/services/auth.service';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { config } from './app/app.config.server';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.tryRestoreSession(),
      deps: [AuthService],
      multi: true
    },
    ...config.providers
  ]
}).catch(err => console.error(err));