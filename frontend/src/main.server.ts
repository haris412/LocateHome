import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

export default function bootstrap(context: BootstrapContext): ReturnType<typeof bootstrapApplication> {
  return bootstrapApplication(AppComponent, config, context);
}