import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './material.module';

import { DataGridComponent } from './components/data-grid/data-grid.component';
import { RowDetailsComponent } from './components/row-details/row-details.component';


@NgModule({
  declarations: [
    DataGridComponent,
    RowDetailsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    DataGridComponent,
    RowDetailsComponent
  ]
})
export class DataGridModule { }