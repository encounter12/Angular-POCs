import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Observable } from 'rxjs';
import { isObservable } from "rxjs";
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectColumnMappingModel } from '../../models/select-models';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { SelectedMasterRow } from '../../models/selected-master-row';
import { RowSelectionService } from '../../helpers/row-selection-service';

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

  @Input() dataSource: Observable<T[]> | T[] = [];
  @Input() rowSelection: boolean = false;
  @Input() subrowSelection: boolean = false;

  @Input() selectColumnMappingModels: SelectColumnMappingModel[] = [];
  @Input() selectInnerColumnMappingModels: SelectColumnMappingModel[] = [];

  @Input() hasFilter = false;
  @Input() hasPagination = true;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  matTableDataSource: MatTableDataSource<AbstractControl> = new MatTableDataSource<AbstractControl>([]);

  mainRowSelectedObj: Subject<SelectedMasterRow> = new Subject<SelectedMasterRow>();

  subrowArrayPropName = 'subrowArray';
  rowSelectionFormControlName = 'dataGridRowSelected';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator | null;
  @ViewChild(MatSort) sort!: MatSort;

  get selectedFormArrayElements(): T[] {
    let selectedElements: T[] = [];

    for (let control of this.parentFormFormArray.controls) {
      const isDataGridRowSelected = (control.get(this.rowSelectionFormControlName)?.value as boolean);

      if (isDataGridRowSelected) {

        let selectedElement = control?.value;

        if (this.expandedDetailFormControlName?.length > 0) {
          const subrows = control.get(this.expandedDetailFormControlName)?.value[this.expandedDetailFormControlName];
         
          let selectedSubrows = subrows?.filter((x: any) => x[this.rowSelectionFormControlName]) ?? [];

          (selectedElement as any)[this.expandedDetailFormControlName] = selectedSubrows;
        }

        selectedElements.push(selectedElement);
      }
    }

    const copiedSelectedElements = this.removeRowSelectionProperties(selectedElements);

    return copiedSelectedElements;
  }

  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    public dataGridHelperService: DataGridHelperService<T>,
    public rowSelectionService: RowSelectionService) {
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

  ngAfterViewInit() {
    if (this.hasPagination) {
      this.matTableDataSource.paginator = this.paginator;
    }

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
      const elements = (this.parentFormGroup.get('parentFormFormArray') as FormArray).controls.map((control: AbstractControl) => {
        let formArrayElementValue = control.value;

        if (this.expandedDetailFormControlName?.length > 0) {
          let expandedDetailArray = control.get(this.expandedDetailFormControlName)?.value[this.expandedDetailFormControlName] ?? [];
          formArrayElementValue[this.expandedDetailFormControlName] = expandedDetailArray;
        }

        return formArrayElementValue;
      });

      const copiedElements = this.removeRowSelectionProperties(elements);

      this.onFormUpdate.emit(copiedElements);
      if (this.rowSelection && this.parentFormGroup.valid) {
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

  removeRowSelectionProperties(elements: any[]): any[] {
    let copiedElements = Array.from(JSON.parse(JSON.stringify(elements)));

      if (this.rowSelection) {
        copiedElements = copiedElements.map((el: any) => {
          delete el[this.rowSelectionFormControlName];
          return el;
        });
      }

      if (this.subrowSelection) {
        copiedElements = copiedElements.map((masterArrayElement: any) => {
          masterArrayElement[this.expandedDetailFormControlName] = Array.from(masterArrayElement[this.expandedDetailFormControlName])
            .map((expandedDetailArrayElement: any) => {
                delete expandedDetailArrayElement[this.rowSelectionFormControlName];
                return expandedDetailArrayElement;
            });

          return masterArrayElement;
        });
      }

      return copiedElements;
  }

  onMasterToggleSelectionChange(event: MatCheckboxChange) {
    return event ? this.masterToggleRowSelection() : null;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleRowSelection() {
    if (this.isAllSelected()) {
      this.rowSelectionService.clearSelectedRows(this.parentFormFormArray.controls, this.rowSelectionFormControlName);

      const selectedMasterRow: SelectedMasterRow = {
        isMainRowSelected: false,
        masterRow: undefined,
        isMasterToggle: true
      };

      this.mainRowSelectedObj.next(selectedMasterRow);
      return;
    }

    this.selectAllRows();

    const selectedMasterRow: SelectedMasterRow = {
      isMainRowSelected: true,
      masterRow: undefined,
      isMasterToggle: true
    };

    this.mainRowSelectedObj.next(selectedMasterRow);
  }

  onRowSelectionChange(event: MatCheckboxChange, row: FormGroup, rowIndex: number) {
    return event ? this.toggleRowSelection(row) : null;
  }

  getDataSource(): Observable<T[]> {
    return (<Observable<T[]>>this.dataSource).pipe(
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

      if (isSubrowArrayColNameValid && subrowArrayDisplayCol?.name === key && !hasSetSubrowArray) {
          arrayElementFormObj[key] = this.buildFormControlArrayObject(key, Array.from(propValue));
          this.subrowArrayPropName = key;
          hasSetSubrowArray = true;
      } else if (propValue.constructor === Array && !hasSetSubrowArray) {
          arrayElementFormObj[key] = this.buildFormControlArrayObject(key, Array.from(propValue));
          hasSetSubrowArray = true;
      } else {
        arrayElementFormObj[key] = this.formBuilder.control(propValue);
      }
    });

    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormObj);

    if (this.rowSelection) {
      arrayElementFormGroup.addControl(this.rowSelectionFormControlName, this.formBuilder.control(false), { emitEvent: false });
    }

    return arrayElementFormGroup;
  }

  private buildFormControlArrayObject(key: string, propValue: any[]): FormControl {
    const subrowArrayObj: any = {};

    if (this.subrowSelection) {
      for (let subrowElement of propValue) {
        subrowElement[this.rowSelectionFormControlName] = false;
      }
    }

    subrowArrayObj[key] = propValue;
    return this.formBuilder.control(subrowArrayObj);
  }

  isAllSelected() {
    const numSelected = this.rowSelectionService.getAllSelectedRowsCount(this.matTableDataSource.data, this.rowSelectionFormControlName);
    const numRows = this.matTableDataSource.data.length;
    return numSelected === numRows;
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
    this.rowSelectionService.toggleRow(row, this.rowSelectionFormControlName);
    let isSelected: boolean = this.rowSelectionService.isRowSelected(row, this.rowSelectionFormControlName);

    const selectedMasterRow: SelectedMasterRow = {
      isMainRowSelected: isSelected,
      masterRow: row,
      isMasterToggle: false
    };

    this.mainRowSelectedObj.next(selectedMasterRow);
  }

  toggleSubrowSelection(row: FormGroup) {
    if (this.getSelectedSubrowsCount(row) > 0 &&
      !this.rowSelectionService.isRowSelected(row, this.rowSelectionFormControlName)) {
        this.rowSelectionService.selectRow(row, this.rowSelectionFormControlName);
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

    subrows?.length ? (this.expandedElement = this.expandedElement === rowElement ? null : rowElement) : null;

    this.changeDetectorRef.detectChanges();
  }

  submit() {
    if (this.rowSelection && this.areSelectedRowsValid()) {
      this.onSubmit.emit(this.selectedFormArrayElements);
    }
  }

  areSelectedRowsValid(): boolean {
    return !this.rowSelectionService.getSelectedRows(this.matTableDataSource.data, this.rowSelectionFormControlName)?.some(r => r.invalid);
  }

  selectAllRows() {
    this.rowSelectionService.selectRows(this.matTableDataSource.data, this.rowSelectionFormControlName);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matTableDataSource.filter = filterValue.trim().toLowerCase();

    if (this.hasPagination && this.matTableDataSource.paginator) {
      this.matTableDataSource.paginator.firstPage();
    }
  }
}
