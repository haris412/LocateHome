import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

const serverImports = [AppModule, ServerModule];

@NgModule({
  imports: serverImports,
  bootstrap: [AppComponent],
})
export class AppServerModule {}
