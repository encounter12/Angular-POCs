import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PeriodicElement } from './periodic-elements/models/periodic-element';

import {
  ELEMENT_DATA,
  PERIODIC_ELEMENTS_COLUMNS_DATA,
  PERIODIC_ELEMENTS_INNER_COLUMNS_DATA,
  PERIODIC_ELEMENTS_SELECT_MODELS,
  PERIODIC_ELEMENTS_INNER_SELECT_MODELS
} from './periodic-elements/data';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  dataSource: PeriodicElement[] = ELEMENT_DATA;
  dataSourceObservable: Observable<PeriodicElement[]> = of(ELEMENT_DATA);

  updatedForm: any[] = [];
  selectedRows: any[] = [];
  submittedElements: any[] = [];

  periodicElementsColDefinition = PERIODIC_ELEMENTS_COLUMNS_DATA;
  innerDisplayColumns = PERIODIC_ELEMENTS_INNER_COLUMNS_DATA;
  periodicElementsSelectModels = PERIODIC_ELEMENTS_SELECT_MODELS;
  periodicElementsInnerSelectModels = PERIODIC_ELEMENTS_INNER_SELECT_MODELS;

  onRowDeleted: PeriodicElement | undefined;

  constructor() {}

  printUpdatedForm(updatedForm: any[]) {
    this.updatedForm = updatedForm;
  }

  onSelectRow(selectedRows: any[]) {
    this.selectedRows = selectedRows;
  }

  onSubmit(submitted: any[]) {
    this.submittedElements = submitted;
  }

  addRow() {
    console.log('added new row');
  }

  deleteRow(elementForDeletion: PeriodicElement) {
    console.log(elementForDeletion);
    this.dataSource = this.dataSource.filter(x => x.position !== elementForDeletion.position);
    this.onRowDeleted = elementForDeletion;
  }
}
