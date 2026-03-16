import { bootstrapApplication } from '@angular/platform-browser';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { config } from './app/app.config.server';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideClientHydration(),
    provideHttpClient(),
    provideAnimationsAsync(),
  ]
}).catch(err => console.error(err));