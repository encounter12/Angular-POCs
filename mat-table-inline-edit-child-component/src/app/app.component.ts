import { Component } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

import { PeriodicElement } from './periodic-elements/models/periodic-element';

import {
  ELEMENT_DATA,
  PERIODIC_ELEMENTS_COLUMNS_DATA,
  PERIODIC_ELEMENTS_INNER_COLUMNS_DATA,
  PERIODIC_ELEMENTS_SELECT_MODELS,
  PERIODIC_ELEMENTS_INNER_SELECT_MODELS,
  ELEMENTS_FOR_ADDITION
} from './periodic-elements/data';
import { ThisReceiver, ThrowStmt } from '@angular/compiler';

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
  elementsForAddition = ELEMENTS_FOR_ADDITION;
  elementsForAdditionCounter: number = 0;

  onRowDeleted: Subject<boolean> = new Subject<boolean>();

  onRowAdded: Subject<boolean> = new Subject<boolean>();

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
    console.log('add new row');
    const rowForAddition: PeriodicElement = this.elementsForAddition[this.elementsForAdditionCounter];

    this.dataSource.push(rowForAddition);

    this.dataSource = JSON.parse(JSON.stringify(this.dataSource));

    this.onRowAdded.next(true);

    if (this.elementsForAdditionCounter < this.elementsForAddition.length - 1) {
      this.elementsForAdditionCounter++;
    }
  }

  deleteRow(elementForDeletion: PeriodicElement) {
    this.dataSource = this.dataSource.filter(x => x.position !== elementForDeletion.position);
    this.onRowDeleted.next(true);
  }

  addNewSubrow(row: PeriodicElement) {
    console.log('add new subrow for row:');
    console.log(row);

  }

  deleteSubrow(obj: { row: PeriodicElement, subrow: Record<string, unknown>}) {
    console.log(`the subrow for deletion is: ${ JSON.stringify(obj.subrow) }`);
    console.log(`the main row is: ${ JSON.stringify(obj.row) }`);
  }
}
