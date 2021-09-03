import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

import { Observable } from 'rxjs';
import { isObservable } from "rxjs";
import { tap } from 'rxjs/operators';

import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service'

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DataGridComponent<T> implements OnInit {
  @Input() displayColumns: ColumnHeader[] = [];
  @Input() innerDisplayColumns: ColumnHeader[] = [];

  @Input() dataSource: Observable<T[]> | T[] = [];
  @Input() rowSelection: boolean = false;

  matTableDataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  selection = new SelectionModel<T>(true, []);

  selectedFormArrayElementIndices: number[] = [];
  selectedFormArrayElements: T[] = [];

  subrowArrayPropName = 'subrowArray';

  @Output() onFormUpdate = new EventEmitter<any[]>();
  @Output() onSelectRow = new EventEmitter<T[]>();
  @Output() onSubmit = new EventEmitter<T[]>();

  expandedDetailFormControlName: string = '';
  columnsProps: string[] = [];
  rowSelectionHasChanged: boolean = false;

  public parentFormFormArray: FormArray = this.formBuilder.array([]);
  public parentFormGroup: FormGroup = this.formBuilder.group({ 'parentFormFormArray': this.parentFormFormArray });

  expandedElement: T | null | undefined;

  isFormEditable = false;

  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private dataGridHelperService: DataGridHelperService<T>) {
  }

  ngOnInit() {
    if (isObservable(this.dataSource)) {
      this.getDataSource().subscribe((data: T[]) => {
        this.initializeMatTable(data);
      });
    } else {
      this.initializeMatTable(this.dataSource);
    }
  }

  initializeMatTable(data: T[]) {
    this.matTableDataSource = new MatTableDataSource<T>(data);
    this.matTableDataSource.data.forEach((pe) => this.addRow(pe));

    const firstDataSourceElement = this.matTableDataSource.data[0];

    if (firstDataSourceElement) {
      this.expandedDetailFormControlName = Object.keys(firstDataSourceElement)
        .find(key => (firstDataSourceElement as any)[key].constructor === Array) ?? '';
    }

    this.parentFormFormArray.valueChanges.subscribe(() => {
      this.onFormUpdate.emit(this.parentFormFormArray.value);
      if (this.rowSelection && this.rowSelectionHasChanged && this.parentFormGroup.valid) {
        this.updateFormArrayElementsOnRowSelectionChange();
        this.onSelectRow.emit(this.selectedFormArrayElements);
      }
    });

    if (this.rowSelection) {
      this.selection.changed.subscribe((x) => {
        this.rowSelectionHasChanged = true;
        this.updateFormArrayElementsOnRowSelectionChange();
        this.onSelectRow.emit(this.selectedFormArrayElements);
      });
    }

    if (this.displayColumns.length === 0) {
      if (firstDataSourceElement) {
        this.columnsProps = Object.keys(firstDataSourceElement)
          .filter((key: string) => (firstDataSourceElement as any)[key].constructor !== Array);

        this.displayColumns = this.dataGridHelperService.buildDefaultDisplayColumns(this.columnsProps, firstDataSourceElement);

        if (this.rowSelection) {
          this.columnsProps.unshift('select');
        }
      }
    } else {
      this.displayColumns = this.displayColumns.filter(dc => !dc.hasSubrowArray);
      this.columnsProps = this.displayColumns.map((col: ColumnHeader) => col.name);

      if (this.rowSelection) {
        this.columnsProps.unshift('select');
      }
    }

    this.isFormEditable = this.displayColumns.some(x => x.isEditable) || this.innerDisplayColumns.some(x => x.isEditable);
  }

  getDataSource(): Observable<T[]> {
    return (<Observable<T[]>>this.dataSource).pipe(
        tap(res => res)
    );
  }

  addRow(rowElement: T) {
    const arrayElementFormObject = this.buildArrayElementFormObject(rowElement);
    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormObject);
    this.parentFormFormArray.push(arrayElementFormGroup);
  }

  buildArrayElementFormObject(rowElement: T): any {
    const arrayElementFormObj: any = {};

    let hasSetSubrowArray = false;

    const subrowArrayDisplayCol: ColumnHeader | undefined = this.displayColumns.find(dc => dc.hasSubrowArray);

    Object.keys(rowElement).forEach((key: string) => {
      const propValue = (rowElement as any)[key];

      const isSubrowArrayColNameValid = subrowArrayDisplayCol &&
        subrowArrayDisplayCol.name &&
        subrowArrayDisplayCol.name.length > 0;

      if (isSubrowArrayColNameValid && subrowArrayDisplayCol?.name === key && !hasSetSubrowArray) {
          arrayElementFormObj[key] = this.buildFormControlArrayObject(key, propValue);
          this.subrowArrayPropName = key;
          hasSetSubrowArray = true;
      } else if (propValue.constructor === Array && !hasSetSubrowArray) {
          arrayElementFormObj[key] = this.buildFormControlArrayObject(key, propValue);
          hasSetSubrowArray = true;
      } else {
        arrayElementFormObj[key] = this.formBuilder.control(propValue);
      }
    });

    return arrayElementFormObj;
  }

  private buildFormControlArrayObject(key: string, propValue: any): FormControl {
    const subrowArrayObj: any = {};
    subrowArrayObj[key] = propValue;
    return this.formBuilder.control(subrowArrayObj);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.matTableDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleRowSelection() {
    if (this.isAllSelected()) {
      this.selectedFormArrayElementIndices = [];
      this.selection.clear();
      return;
    }

    this.selectedFormArrayElementIndices = this.dataGridHelperService.range(this.parentFormFormArray.length, 0);
    this.selection.select(...this.matTableDataSource.data);
  }

  toggleRowSelection(row: any, rowIndex: number) {
    const isSelected = this.selection.isSelected(row);

    if (!isSelected && !this.selectedFormArrayElementIndices.some(x => x === rowIndex)) {
      this.selectedFormArrayElementIndices.push(rowIndex);
    } else if (isSelected && this.selectedFormArrayElementIndices.some(x => x === rowIndex)) {
      this.selectedFormArrayElementIndices = this.selectedFormArrayElementIndices.filter(e => e !== rowIndex);
    }

    this.selection.toggle(row);
  }

  updateFormArrayElementsOnRowSelectionChange() {
    this.selectedFormArrayElements = [];

    this.selectedFormArrayElementIndices.forEach((val) => {
      const element = this.parentFormFormArray.at(val).value;
      this.selectedFormArrayElements.push(element);
    });
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: T, rowIndex?: number): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${rowIndex ?? 0 + 1}`;
  }

  toggleExpandRow(rowElement: T) {
    (rowElement as any)[this.expandedDetailFormControlName] && (rowElement as any)[this.expandedDetailFormControlName].length ?
      (this.expandedElement = this.expandedElement === rowElement ? null : rowElement) : null;

    this.changeDetectorRef.detectChanges();
  }

  submit() {
    if (this.rowSelection && this.areSelectedRowsValid()) {
      this.onSubmit.emit(this.selectedFormArrayElements);
    }
  }

  areSelectedRowsValid(): boolean {
    const areValid = !this.selectedFormArrayElementIndices.some(el => this.parentFormFormArray.at(el).invalid)
    return areValid;
  }
}
