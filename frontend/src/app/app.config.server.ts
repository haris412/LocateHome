import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { appConfig } from './app.config';

// Server-only additions — everything else comes from shared appConfig
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

// mergeApplicationConfig correctly handles duplicate tokens:
// if browser and server both register the same provider, server config wins.
export const config = mergeApplicationConfig(appConfig, serverConfig);
