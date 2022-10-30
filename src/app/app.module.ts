import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScUnitComponent } from './sc-unit/sc-unit.component';
import {HttpClientModule} from "@angular/common/http";
import {ENVIRONMENT} from "./environment.service";
import {environment} from "../environments/environment";
import { SafePipe } from './safe.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ScUnitComponent,
    SafePipe
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule
  ],
  // We declare environment as provider to be able to easy test our service
  providers: [{ provide: ENVIRONMENT, useValue: environment }],
  bootstrap: [AppComponent]
})
export class AppModule { }
