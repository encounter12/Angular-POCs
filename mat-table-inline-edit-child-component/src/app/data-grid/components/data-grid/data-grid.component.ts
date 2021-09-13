import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

import { Observable } from 'rxjs';
import { isObservable } from "rxjs";
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectColumnMappingModel } from '../../models/select-models';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { SelectedFormArrayElement } from '../../models/selected-form-array-element';

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
  @Input() subrowSelection: boolean = false;

  @Input() selectColumnMappingModels: SelectColumnMappingModel[] = [];
  @Input() selectInnerColumnMappingModels: SelectColumnMappingModel[] = [];

  @Input() hasFilter = false;

  matTableDataSource: MatTableDataSource<AbstractControl> = new MatTableDataSource<AbstractControl>([]);
  selection = new SelectionModel<AbstractControl>(true, []);

  selectedFormArrayElementIndices: SelectedFormArrayElement[] = [];
  selectedFormArrayElements: T[] = [];

  mainRowSelectedObj: Subject<{ isMainRowSelected: boolean, masterRowIndex: number | null}> = new Subject<{ isMainRowSelected: boolean, masterRowIndex: number | null}>();

  subrowArrayPropName = 'subrowArray';

  @Output() onFormUpdate = new EventEmitter<any[]>();
  @Output() onSelectRow = new EventEmitter<T[]>();
  @Output() onSubmit = new EventEmitter<T[]>();

  expandedDetailFormControlName: string = '';
  columnsProps: string[] = [];
  rowSelectionHasChanged: boolean = false;

  public parentFormFormArray: FormArray = this.formBuilder.array([]);
  public parentFormGroup: FormGroup = this.formBuilder.group({ 'parentFormFormArray': this.parentFormFormArray });

  expandedElement: FormGroup | null | undefined;

  isFormEditable = false;

  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    public dataGridHelperService: DataGridHelperService<T>) {
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

    const firstDataSourceElement = data[0];

    const subrowArrayColumn = this.displayColumns.find(c => c.hasSubrowArray);

    if (subrowArrayColumn && firstDataSourceElement && subrowArrayColumn.name === (firstDataSourceElement as any)['name']) {
      this.expandedDetailFormControlName = subrowArrayColumn.name;
    } else if (firstDataSourceElement) {
      this.expandedDetailFormControlName = Object.keys(firstDataSourceElement)
        .find(key => (firstDataSourceElement as any)[key].constructor === Array) ?? '';
    }

    data.forEach((pe) => this.addRow(pe));

    this.matTableDataSource = new MatTableDataSource<AbstractControl>(this.parentFormFormArray.controls);

    if (this.hasFilter) {
      const filterPredicate = this.matTableDataSource.filterPredicate;
      this.matTableDataSource.filterPredicate = (data: AbstractControl, filter: string): boolean => {
        return filterPredicate.call(this.matTableDataSource, data.value, filter);
      }
    }

    this.parentFormFormArray.valueChanges.subscribe(() => {
      this.onFormUpdate.emit(this.parentFormFormArray.value);
      if (this.rowSelection && this.rowSelectionHasChanged && this.parentFormGroup.valid) {
        this.updateFormArrayElementsOnSelectionChange();
        this.onSelectRow.emit(this.selectedFormArrayElements);
      }
    });

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

  onMasterToggleSelectionChange(event: MatCheckboxChange) {
    return event ? this.masterToggleRowSelection() : null;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleRowSelection() {
    if (this.isAllSelected()) {
      this.selectedFormArrayElementIndices = [];
      this.selection.clear();
      this.mainRowSelectedObj.next({ isMainRowSelected: false, masterRowIndex: null});
      return;
    }

    this.selectedFormArrayElementIndices = this.buildMarkedSelectedFormArrayElementIndices();
    this.selection.select(...this.matTableDataSource.data);
    this.mainRowSelectedObj.next({ isMainRowSelected: true, masterRowIndex: null});
  }

  onRowSelectionChange(event: MatCheckboxChange, row: FormGroup, rowIndex: number) {
    return event ? this.toggleRowSelection(row, rowIndex) : null;
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

  buildMarkedSelectedFormArrayElementIndices(): SelectedFormArrayElement[] {
    let selectedFormArrayElementIndices: SelectedFormArrayElement[] = [];

    this.parentFormFormArray.value.forEach((el: T, currentIndex: number) => {
      let selectedFormArrayElement = new SelectedFormArrayElement(currentIndex, []);

      const subrowArray = Array.from((el as any)[this.expandedDetailFormControlName]);
      subrowArray.forEach((_, index) => {
        selectedFormArrayElement.subrowFormArrayElements?.push(new SelectedFormArrayElement(index, []));
      });

      selectedFormArrayElementIndices.push(selectedFormArrayElement);
    });

    return selectedFormArrayElementIndices;
  }

  
  buildSelectedFormArrayElement(rowIndex: number, formArray: FormArray): SelectedFormArrayElement {
    let selectedFormArrayElement = new SelectedFormArrayElement(rowIndex, []);
    const parentFormArrayElement = formArray.at(rowIndex).value;

    if (this.expandedDetailFormControlName && this.expandedDetailFormControlName.length > 0) {
      const subrowArray = Array.from(parentFormArrayElement[this.expandedDetailFormControlName][this.expandedDetailFormControlName]);

      subrowArray.forEach((ch, index) => {
        selectedFormArrayElement.subrowFormArrayElements?.push(new SelectedFormArrayElement(index, []));
      });
    }
    return selectedFormArrayElement;
  }

  toggleRowSelection(row: FormGroup, rowIndex: number) {
    const isSelectedBeforeChange = this.selection.isSelected(row);
    let isGoingToBeSelected = false;

    if (!isSelectedBeforeChange && !this.selectedFormArrayElementIndices.some(x => x.index === rowIndex)) {
      const selectedFormArrayElement = this.buildSelectedFormArrayElement(rowIndex, this.parentFormFormArray);
      this.selectedFormArrayElementIndices.push(selectedFormArrayElement);
      isGoingToBeSelected = true;
    } else if (isSelectedBeforeChange && this.selectedFormArrayElementIndices.some(x => x.index === rowIndex)) {
      this.selectedFormArrayElementIndices = this.selectedFormArrayElementIndices.filter(e => e.index !== rowIndex);
      isGoingToBeSelected = false;
    }

    this.rowSelectionHasChanged = true;
    this.updateFormArrayElementsOnSelectionChange();

    this.onSelectRow.emit(this.selectedFormArrayElements);
    this.selection.toggle(row);
    this.mainRowSelectedObj.next({ isMainRowSelected: isGoingToBeSelected, masterRowIndex: rowIndex});
  }

  updateFormArrayElementsOnSelectionChange() {
    this.selectedFormArrayElements = [];

    this.selectedFormArrayElementIndices.forEach((selectedFormArrayElement: SelectedFormArrayElement) => {

      const formArrayElementFormGroup = this.parentFormFormArray.at(selectedFormArrayElement.index) as FormGroup;
      const formArrayElementFormGroupControls = formArrayElementFormGroup.controls;

      const subrows = formArrayElementFormGroupControls[this.expandedDetailFormControlName].value[this.expandedDetailFormControlName];

      let selectedMasterElement: any = {};

      for (const field in formArrayElementFormGroupControls) {
        if (field !== this.expandedDetailFormControlName) {
          const control = formArrayElementFormGroup.get(field);
          selectedMasterElement[field] = control?.value;
        }
      }

      if (this.expandedDetailFormControlName && this.expandedDetailFormControlName.length > 0 && subrows && subrows.length > 0) {
        const selectedSubrows: any[] = [];
        selectedFormArrayElement.subrowFormArrayElements.forEach((selectedSubrowArrayElement: SelectedFormArrayElement) => {
          selectedSubrows.push(subrows[selectedSubrowArrayElement.index]);
        });

        const subrowsObj: any = {};
        subrowsObj[this.expandedDetailFormControlName] = selectedSubrows;

        selectedMasterElement[this.expandedDetailFormControlName] = subrowsObj;
      }

      this.selectedFormArrayElements.push(selectedMasterElement);
    });
  }

  toggleSubrowSelection(selectedSubrows: any) {
    if (selectedSubrows && 
      selectedSubrows.selectedFormArrayElementIndices &&
      selectedSubrows.selectedFormArrayElementIndices.length > 0) {
        this.selection.select(this.matTableDataSource.data[selectedSubrows.masterRowIndex]);
    }

    const index = this.selectedFormArrayElementIndices.findIndex(x => x.index === selectedSubrows.masterRowIndex);

    if (index === -1 && selectedSubrows.selectedFormArrayElementIndices.length > 0) {
      const selectedFormArrayElement = new SelectedFormArrayElement(selectedSubrows.masterRowIndex, selectedSubrows.selectedFormArrayElementIndices)
      this.selectedFormArrayElementIndices.push(selectedFormArrayElement);
    } else if (index > -1) {
      this.selectedFormArrayElementIndices[index].subrowFormArrayElements = selectedSubrows.selectedFormArrayElementIndices;
    }
    
    this.updateFormArrayElementsOnSelectionChange();

    this.onSelectRow.emit(this.selectedFormArrayElements);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: AbstractControl, rowIndex?: number): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${rowIndex ?? 0 + 1}`;
  }

  toggleExpandRow(rowElement: FormGroup) {
    rowElement.value[this.expandedDetailFormControlName] && 
    rowElement.value[this.expandedDetailFormControlName][this.expandedDetailFormControlName]
    rowElement.value[this.expandedDetailFormControlName][this.expandedDetailFormControlName].length > 0 ?
      (this.expandedElement = this.expandedElement === rowElement ? null : rowElement) : null;

    this.changeDetectorRef.detectChanges();
  }

  submit() {
    if (this.rowSelection && this.areSelectedRowsValid()) {
      this.onSubmit.emit(this.selectedFormArrayElements);
    }
  }

  areSelectedRowsValid(): boolean {
    const areValid = !this.selectedFormArrayElementIndices.some(el => this.parentFormFormArray.at(el.index).invalid)
    return areValid;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matTableDataSource.filter = filterValue.trim().toLowerCase();
  }
}
