import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079 },
  { position: 2, name: 'Helium', weight: 4.0026 }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight'];
  dataSource = ELEMENT_DATA;

  rows: FormArray = this.formBuilder.array([]);
  namesForm: FormGroup = this.formBuilder.group({ names: this.rows });

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.dataSource.forEach((pe: PeriodicElement) => this.addRow(pe.position, pe.name, pe.weight));
  }

  addRow(position: number, name: string, weight: number) {
    const row = this.formBuilder.group({
      position: position,
      name: name,
      weight: weight
    });

    this.rows.push(row);
  }
}
