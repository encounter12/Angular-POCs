import { Component, OnInit } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

import { PeriodicElement } from './periodic-elements/models/periodic-element';

import {
  ELEMENT_DATA,
  PERIODIC_ELEMENTS_COLUMNS_DATA,
  PERIODIC_ELEMENTS_INNER_COLUMNS_DATA,
  PERIODIC_ELEMENTS_SELECT_MODELS,
  PERIODIC_ELEMENTS_INNER_SELECT_MODELS,
  ELEMENTS_FOR_ADDITION,
  ISOTOPES_FOR_ADDITION
} from './periodic-elements/data';

import { Isotope } from './periodic-elements/models/isotope';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isDataSourceObservable = true;

  dataSource: PeriodicElement[] = ELEMENT_DATA;
  dataSourceBehaviorSubject = new BehaviorSubject<PeriodicElement[]>(ELEMENT_DATA);
  dataSourceObservable = this.dataSourceBehaviorSubject.asObservable();

  updatedForm: any[] = [];
  selectedRows: any[] = [];
  submittedElements: any[] = [];

  periodicElementsColDefinition = PERIODIC_ELEMENTS_COLUMNS_DATA;
  innerDisplayColumns = PERIODIC_ELEMENTS_INNER_COLUMNS_DATA;
  periodicElementsSelectModels = PERIODIC_ELEMENTS_SELECT_MODELS;
  periodicElementsInnerSelectModels = PERIODIC_ELEMENTS_INNER_SELECT_MODELS;
  elementsForAddition = ELEMENTS_FOR_ADDITION;
  isotopesForAddition = ISOTOPES_FOR_ADDITION;
  elementsForAdditionCounter: number = 0;
  isotopesForAdditionCounter: number = 0;

  onRowDeleted: Subject<boolean> = new Subject<boolean>();

  onRowAdded: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  ngOnInit() {
  }

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
    const rowForAddition: PeriodicElement = this.elementsForAddition[this.elementsForAdditionCounter];

    this.addRowToData(rowForAddition);
    this.getData();

    if (this.isDataSourceObservable) {
      this.dataSourceBehaviorSubject.next(this.dataSource);
    }

    this.onRowAdded.next(true);

    if (this.elementsForAdditionCounter < this.elementsForAddition.length - 1) {
      this.elementsForAdditionCounter++;
    }
  }

  private addRowToData(row: PeriodicElement) {
    this.dataSource.push(row);
  }

  private getData() {
    this.dataSource = JSON.parse(JSON.stringify(this.dataSource));
  }

  deleteRow(elementForDeletion: PeriodicElement) {

    this.deleteRowFromData(elementForDeletion);

    if (this.isDataSourceObservable) {
      this.dataSourceBehaviorSubject.next(this.dataSource);
    }

    this.onRowDeleted.next(true);
  }

  private deleteRowFromData(elementForDeletion: PeriodicElement) {
    this.dataSource = this.dataSource.filter(x => x.position !== elementForDeletion.position);
  }

  addNewSubrow(periodicElementRow: PeriodicElement) {
    this.addSubrowToData(periodicElementRow);

    if (this.isDataSourceObservable) {
      this.dataSourceBehaviorSubject.next(this.dataSource);
    }

    if (this.isotopesForAdditionCounter + 1 === this.isotopesForAddition.length) {
      this.isotopesForAdditionCounter = 0;
    } else {
      this.isotopesForAdditionCounter++;
    }
  }

  private addSubrowToData(periodicElementRow: PeriodicElement) {
    let periodicElementIsotopes = this.dataSource.find((x: PeriodicElement) => x.position === periodicElementRow.position)?.isotopes;

    const currentIsotopeForAddition = this.isotopesForAddition[this.isotopesForAdditionCounter];
    periodicElementIsotopes?.push(currentIsotopeForAddition);

    this.dataSource = this.dataSource.map((periodicElement: PeriodicElement) => {
      if (periodicElement.position === periodicElementRow.position) {
        periodicElement.isotopes = periodicElementIsotopes ?? [];
      }

      return periodicElement;
    })
  }

  deleteSubrow(obj: { row: PeriodicElement, subrow: Isotope }) {
    this.deleteSubrowFromData(obj);

    if (this.isDataSourceObservable) {
      this.dataSourceBehaviorSubject.next(this.dataSource);
    }
  }

  private deleteSubrowFromData(obj: { row: PeriodicElement, subrow: Isotope }) {
    this.dataSource = this.dataSource.map((row: PeriodicElement) => {
      row.isotopes = row.isotopes.filter((sr: Isotope) => sr.name !== obj.subrow.name);
      return row;
    })
  }
}
