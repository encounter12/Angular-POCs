import { Component } from '@angular/core';
import { PeriodicElement } from './interfaces/periodic-element';

import { ELEMENT_DATA, PERIODIC_ELEMENTS_COLUMNS_DATA, PERIODIC_ELEMENTS_INNER_COLUMNS_DATA } from './parent-row/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  dataSource: PeriodicElement[] = ELEMENT_DATA;
  updatedForm: any[] = [];

  periodicElementsColDefinition = PERIODIC_ELEMENTS_COLUMNS_DATA;
  innerDisplayColumns = PERIODIC_ELEMENTS_INNER_COLUMNS_DATA;

  constructor() {}

  printUpdatedForm(updatedForm: any[]) {
    this.updatedForm = updatedForm;
  }
}
