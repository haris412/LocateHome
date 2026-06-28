import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideToastr } from 'ngx-toastr';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Batch multiple DOM events fired in the same tick into one change detection cycle.
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(appRoutes),

    // withFetch() — Node.js has no XMLHttpRequest; HttpClient must use the fetch API during SSR
    // so that HTTP calls made on the server (e.g. loading listings) actually resolve.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideToastr(),

    // Tells Angular to reuse server-rendered HTML instead of re-rendering on the client.
    // withEventReplay() queues user interactions that happen before hydration completes.
    provideClientHydration(withEventReplay()),
  ]
};
