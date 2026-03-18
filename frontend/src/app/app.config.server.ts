import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

import { appRoutes } from './app.routes';

export const config: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNativeDateAdapter()
  ]
};