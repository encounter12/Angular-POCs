import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';

import { RowDetailsComponent } from './row-details/row-details/row-details.component';
import { ParentRowComponent } from './parent-row/parent-row.component';

@NgModule({
  declarations: [
    AppComponent,
    RowDetailsComponent,
    ParentRowComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
