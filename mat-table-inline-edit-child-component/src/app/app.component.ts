import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { PeriodicElement } from './interfaces/periodic-element';
import { Isotope } from './interfaces/isotope';

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    elements: [
    {
     name: 'Protium',
     protons: 1, 
     neutrons: 0
    },
    {
      name: 'Deuterium',
      protons: 1, 
      neutrons: 1
    },
    {
      name: 'Tritium',
      protons: 1, 
      neutrons: 2
    }]
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    elements: [
    {
      name: 'Helium-2 (diproton)',
      protons: 2, 
      neutrons: 0
    },
    {
      name: 'Helium-3',
      protons: 2, 
      neutrons: 1
    },
    {
      name: 'Helium-4',
      protons: 2, 
      neutrons: 2
    }]
  }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight'];
  dataSource = ELEMENT_DATA;

  public parentFormFormArray: FormArray = this.formBuilder.array([]);
  public parentFormGroup: FormGroup = this.formBuilder.group({ 'parentFormFormArray': this.parentFormFormArray });

  expandedElement: PeriodicElement | null | undefined;

  constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.dataSource.forEach((pe: PeriodicElement) => this.addRow(pe.position, pe.name, pe.weight, pe.elements));
  }

  addRow(position: number | undefined, name: string | undefined | null, weight: number | undefined, elements: Isotope[]) {
    const row = this.formBuilder.group({
      position: position,
      name: name,
      weight: weight,
      expandedDetail: this.formBuilder.control(elements)
    });

    this.parentFormFormArray.push(row);
  }

  toggleRow(element: PeriodicElement) {
    element.elements && element.elements.length ?
      (this.expandedElement = this.expandedElement === element ? null : element) : null;

    this.changeDetectorRef.detectChanges();
  }
}
