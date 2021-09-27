import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';

import { FormArray, FormBuilder, FormControl, FormGroup, AbstractControl, Validators, ValidatorFn } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { isObservable } from "rxjs";
import { tap } from 'rxjs/operators';

import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectColumnMappingModel } from '../../models/select-models';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { RowSelectionService } from '../../helpers/row-selection-service';
import { ValidationObject } from '../../models/validation-object';
import { ValidationService } from '../../helpers/validation-service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

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
export class DataGridComponent<T> implements OnInit, AfterViewInit {
  @Input() displayColumns: ColumnHeader[] = [];
  @Input() innerDisplayColumns: ColumnHeader[] = [];

  private _dataSource: Observable<T[]> | T[] = [];
    
  @Input() set dataSource(value: Observable<T[]> | T[]) {
    if (isObservable(value)) {
      this.getDataSource(value).subscribe((data: T[]) => {
        this._dataSource = data;
        this.initializeMatTable(this._dataSource);
        this.setPaginationAndSorting();
      });
    } else {
      this._dataSource = value;
      this.initializeMatTable(this._dataSource as T[]);
      this.setPaginationAndSorting();
    }
  }

  public get dataSource(): Observable<T[]> | T[] {
    return this._dataSource;
  }

  @Input() rowSelection: boolean = false;
  @Input() subrowSelection: boolean = false;

  @Input() selectColumnMappingModels: SelectColumnMappingModel[] = [];
  @Input() selectInnerColumnMappingModels: SelectColumnMappingModel[] = [];

  @Input() hasFilter = false;
  @Input() hasPagination = false;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  @Input() hasSorting = false;

  matTableDataSource: MatTableDataSource<AbstractControl> = new MatTableDataSource<AbstractControl>([]);

  subrowArrayPropName = 'subrowArray';
  rowSelectionFormControlName = 'dataGridRowSelected';
  isElementExpandedFormControlName = 'dataGridIsElementExpanded';

  @Output() onFormUpdate = new EventEmitter<any[]>();
  @Output() onSelectRow = new EventEmitter<{ rows: T[], areValid: boolean }>();
  @Output() onSubmit = new EventEmitter<T[]>();
  
  @Output() onRowAddition = new EventEmitter();
  @Output() onRowDeletion = new EventEmitter<T>();

  @Output() onSubrowAddition = new EventEmitter<T>();
  @Output() onSubrowDeletion = new EventEmitter<any>();

  expandedDetailFormControlName: string = '';
  columnsProps: string[] = [];
  rowSelectionHasChanged: boolean = false;

  public parentFormFormArray: FormArray = this.formBuilder.array([]);
  public parentFormGroup: FormGroup = this.formBuilder.group({ 'parentFormFormArray': this.parentFormFormArray });

  expandedElement: FormGroup | null | undefined;

  isFormEditable = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator | null;
  @ViewChild(MatSort) sort!: MatSort;

  geSelectedFormArrayElements(): T[] {
    let selectedElements: T[] = [];

    for (let control of this.parentFormFormArray.controls) {
      const isDataGridRowSelected = (control.get(this.rowSelectionFormControlName)?.value as boolean);

      if (isDataGridRowSelected) {
        const selectedElement = this.transformRowFormControlToObject(control, true);
        selectedElements.push(selectedElement);
      }
    }

    return selectedElements;
  }

  private transformRowFormControlToObject(control: AbstractControl, filterSelected: boolean): T {
    let selectedElement = JSON.parse(JSON.stringify(control?.value));

    if (this.rowSelection) {
      delete selectedElement[this.rowSelectionFormControlName];
    }

    const subrows = Array.from(control.get(this.expandedDetailFormControlName)?.value[this.expandedDetailFormControlName] ?? []);

    if (this.expandedDetailFormControlName?.length > 0 && subrows && subrows.length > 0) {

      delete selectedElement[this.isElementExpandedFormControlName];

      let selectedSubrows = subrows;

      if (filterSelected) {
        selectedSubrows = subrows?.filter((x: any) => x[this.rowSelectionFormControlName]) ?? [];
      }

      let copiedSelectedSubrows = JSON.parse(JSON.stringify(selectedSubrows));

      copiedSelectedSubrows = copiedSelectedSubrows
        .map((expandedDetailArrayElement: any) => {
          if (this.rowSelection) {
            delete expandedDetailArrayElement[this.rowSelectionFormControlName];
          }

          return expandedDetailArrayElement;
        });

      (selectedElement as any)[this.expandedDetailFormControlName] = copiedSelectedSubrows;
    }

    return selectedElement;
  }

  constructor(
    private formBuilder: FormBuilder,
    public dataGridHelperService: DataGridHelperService<T>,
    public rowSelectionService: RowSelectionService,
    public dialog: MatDialog,
    public validationService: ValidationService,
    public changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.initializeMatTable(this.dataSource as T[]);
    this.setPaginationAndSorting();
  }

  ngAfterViewInit() {
    if (this.hasPagination) {
      this.setPagination();
    }

    if (this.hasSorting) {
      this.setSorting();
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  setPagination() {
    this.matTableDataSource.paginator = this.paginator;
  }

  setSorting() {
    this.matTableDataSource.sort = this.sort;

    this.matTableDataSource.sortData = (data: AbstractControl[], sort: MatSort) => {
      const factor =
        sort.direction === "asc" ? 1 : sort.direction === "desc" ? -1 : 0;

      if (factor) {
        data = data.sort((a: AbstractControl, b: AbstractControl) => {
          const aValue = a.get(sort.active) ? a.get(sort.active)?.value : null;
          const bValue = a.get(sort.active) ? b.get(sort.active)?.value : null;
          return aValue > bValue ? factor : aValue < bValue ? -factor : 0;
        });
      }
      return data;
    };
  }

  initializeMatTable(data: T[]) {
    data = JSON.parse(JSON.stringify(data));

    const firstDataSourceElement = data[0];
    this.parentFormFormArray = this.formBuilder.array([])

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
      const elements = this.parentFormFormArray.controls.map((control: AbstractControl) => {
        let formArrayElementValue = this.transformRowFormControlToObject(control, false);
        return formArrayElementValue;
      });

      this.onFormUpdate.emit(elements);

      const selectedFormArrayElements = this.geSelectedFormArrayElements();

      if (this.rowSelection && this.parentFormGroup.valid && selectedFormArrayElements?.length > 0) {
        this.onSelectRow.emit({ 
          rows: selectedFormArrayElements,
          areValid: this.areSelectedRowsValid(this.matTableDataSource.data, this.rowSelectionFormControlName)
        });
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

    this.columnsProps.push('actions');

    this.isFormEditable = this.displayColumns.some(x => x.isEditable) || this.innerDisplayColumns.some(x => x.isEditable);
  }

  onMasterToggleSelectionChange(event: MatCheckboxChange) {
    return event ? this.masterToggleRowSelection() : null;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleRowSelection() {
    if (this.isAllSelected()) {
      this.clearAllRows();
      return;
    }

    this.selectAllRowsOnPage();
  }

  clearAllRows() {
    const rowsOnPage = this.getCurrentPageRows();
    this.rowSelectionService.clearSelectedRows(rowsOnPage, this.rowSelectionFormControlName, this.expandedDetailFormControlName);
  }

  onRowSelectionChange(event: MatCheckboxChange, row: FormGroup) {
    return event ? this.toggleRowSelection(row) : null;
  }

  getDataSource(rowData: Observable<T[]>): Observable<T[]> {
    return rowData.pipe(
        tap(res => res)
    );
  }

  addRow(rowElement: T) {
    const arrayElementFormGroup = this.buildArrayElementFormGroup(rowElement);
    this.parentFormFormArray.push(arrayElementFormGroup);
  }

  buildArrayElementFormGroup(rowElement: T): FormGroup {
    const arrayElementFormObj: any = {};

    let hasSetSubrowArray = false;

    const subrowArrayDisplayCol: ColumnHeader | undefined = this.displayColumns.find(dc => dc.hasSubrowArray);

    Object.keys(rowElement).forEach((key: string) => {
      const propValue = (rowElement as any)[key];

      const isSubrowArrayColNameValid = subrowArrayDisplayCol &&
        subrowArrayDisplayCol.name &&
        subrowArrayDisplayCol.name.length > 0;

      const currentDisplayCol: ColumnHeader | undefined = this.displayColumns.find(dc => dc.name === key);

      if (isSubrowArrayColNameValid && subrowArrayDisplayCol?.name === key && !hasSetSubrowArray) {
          arrayElementFormObj[key] = this.buildFormControlArrayObject(key, Array.from(propValue), currentDisplayCol?.validators);
          this.subrowArrayPropName = key;
          hasSetSubrowArray = true;
      } else if (propValue.constructor === Array && !hasSetSubrowArray) {
          arrayElementFormObj[key] = this.buildFormControlArrayObject(key, Array.from(propValue), currentDisplayCol?.validators);
          hasSetSubrowArray = true;
      } else {
        arrayElementFormObj[key] = this.formBuilder.control(propValue, this.buildValidatorsForControl(currentDisplayCol?.validators));
      }
    });

    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormObj);

    if (this.rowSelection) {
      arrayElementFormGroup.addControl(this.rowSelectionFormControlName, this.formBuilder.control(false), { emitEvent: false });
    }

    arrayElementFormGroup.addControl(this.isElementExpandedFormControlName, this.formBuilder.control(false), { emitEvent: false });

    return arrayElementFormGroup;
  }

  public getCellValidationMessage(cellFormControl: AbstractControl, validationObjects: ValidationObject[]): string {
    return this.validationService.getCellValidationMessage(cellFormControl, validationObjects);
  }

  private buildValidatorsForControl(validationObjects: ValidationObject[] | undefined): ValidatorFn[] {
    return this.validationService.buildValidatorsForControl(validationObjects);
  }

  private buildFormControlArrayObject(key: string, propValue: any[], validationObjects: ValidationObject[] | undefined): FormControl {
    const subrowArrayObj: any = {};

    if (this.rowSelection) {
      for (let subrowElement of propValue) {
        subrowElement[this.rowSelectionFormControlName] = false;
      } 
    }

    subrowArrayObj[key] = propValue;
    return this.formBuilder.control(subrowArrayObj);
  }

  isAllSelected() {
    let pageSize = this.matTableDataSource.data.length ?? 0;

    if (this.hasPagination) {
      pageSize = this.matTableDataSource.paginator?.pageSize ?? 10;
    }

    const curentPageRows = this.getCurrentPageRows();
    const areAllRowsOnPageSelected = this.rowSelectionService.areAllRowsSelected(curentPageRows, this.rowSelectionFormControlName);
    return areAllRowsOnPageSelected;
  }

  getCurrentPageRows() {
    return this.matTableDataSource.connect().value;
  }

  selectAllRowsOnPage() {
    const rowsOnPage = this.getCurrentPageRows();

    this.rowSelectionService.selectRows(rowsOnPage, this.rowSelectionFormControlName, this.expandedDetailFormControlName);
  }

  getSelectedDisplayValue(row: AbstractControl, columnName: string): any {
    return this.dataGridHelperService.getSelectedDisplayValue(row.get(columnName)?.value, columnName, this.selectColumnMappingModels);
  }

  isRowSelected(row: AbstractControl): boolean {
    return this.rowSelectionService.isRowSelected(row, this.rowSelectionFormControlName);
  }

  hasSelectedRow(): boolean {
    return this.rowSelectionService.hasSelectedRow(this.matTableDataSource.data, this.rowSelectionFormControlName);
  }

  toggleRowSelection(row: FormGroup) {
    this.rowSelectionService.toggleRow(row, this.rowSelectionFormControlName, this.expandedDetailFormControlName);
  }

  toggleSubrowSelection(row: FormGroup) {
    if (this.getSelectedSubrowsCount(row) > 0 &&
      !this.isRowSelected(row)) {
        this.rowSelectionService.selectRow(row, this.rowSelectionFormControlName, undefined);
    }
  }

  getSelectedSubrowsCount(row: FormGroup): number {
    const selectedSubrows = row?.get(this.expandedDetailFormControlName)?.value?.[this.expandedDetailFormControlName]
      .filter((x: any) => x[this.rowSelectionFormControlName]);

    return Array.from(selectedSubrows)?.length ?? 0;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: AbstractControl, rowIndex?: number): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.rowSelectionService.isRowSelected(row, this.rowSelectionFormControlName) ? 'deselect' : 'select'} row ${rowIndex ?? 0 + 1}`;
  }

  toggleExpandRow(rowElement: FormGroup) {
    const subrows = rowElement?.get(this.expandedDetailFormControlName)?.value?.[this.expandedDetailFormControlName];
    this.expandedElement = this.expandedElement === rowElement ? null : rowElement;

    if (this.expandedElement) {
      rowElement.get(this.isElementExpandedFormControlName)?.setValue(true);
    }
  }

  submit() {
    if (this.rowSelection && this.areSelectedRowsValid(this.matTableDataSource.data, this.rowSelectionFormControlName)) {
      const selectedFormArrayElements = this.geSelectedFormArrayElements();
      this.onSubmit.emit(selectedFormArrayElements);
    }
  }

  areSelectedRowsValid(allRows: AbstractControl[], rowSelectionFormControlName: string): boolean {
    return this.rowSelectionService.areSelectedRowsValid(allRows, rowSelectionFormControlName);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matTableDataSource.filter = filterValue.trim().toLowerCase();

    if (this.hasPagination && this.matTableDataSource.paginator) {
      this.matTableDataSource.paginator.firstPage();
    }
  }

  addNewRow() {
    this.onRowAddition.emit();
  }

  deleteRow(row: FormGroup) {
    const transformedRow = this.transformRowFormControlToObject(row, false);
    this.onRowDeletion.emit(transformedRow);
  }

  addNewSubrow(row: FormGroup) {
    const rowObj = this.transformRowFormControlToObject(row, false);
    this.onSubrowAddition.emit(rowObj);
  }

  deleteSubrow(subrow: any, row: FormGroup) {
    const rowObj = this.transformRowFormControlToObject(row, false);
    this.onSubrowDeletion.emit({
      row: rowObj,
      subrow: subrow
    });
  }

  setPaginationAndSorting() {
    if (this.hasPagination) {
      this.setPagination();
    }

    if (this.hasSorting) {
      this.setSorting();
    }
  }

  onMasterDatePickerChange(event: MatDatepickerInputEvent<Date>) {
    const selectedDate: Date | null = event.value;
    console.log(selectedDate);
  }
}
