import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { BillingInfoUnnestedComponent } from './billing-info-unnested/billing-info-unnested.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { AddressComponent } from './address/address.component';
import { AddressInfoComponent } from './address-info/address-info.component';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    HelloComponent,
    BillingInfoUnnestedComponent,
    BasicInfoComponent,
    AddressComponent,
    AddressInfoComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
