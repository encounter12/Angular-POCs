import { Component, forwardRef, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
	FormBuilder,
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
	Validator,
	NG_VALIDATORS,
	AbstractControl,
	ValidationErrors,
  FormArray
} from '@angular/forms';

import { Observable, Subscription } from 'rxjs';
import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectColumnMappingModel } from '../../models/select-models';

import { MatTableDataSource } from '@angular/material/table';
import { SelectedMasterRow } from '../../models/selected-master-row';
import { RowSelectionService } from '../../helpers/row-selection-service';

@Component({
  selector: 'app-row-details',
  templateUrl: './row-details.component.html',
  styleUrls: ['./row-details.component.css'],
  providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => RowDetailsComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => RowDetailsComponent),
			multi: true
		}
	]
})
export class RowDetailsComponent<T> implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  
  @Input() innerDisplayColumns: ColumnHeader[] = [];

  @Input() subrowArrayPropName: string = '';

  @Input() selectInnerColumnMappingModels: SelectColumnMappingModel[] = [];

  @Input() subrowSelection: boolean = false;

  @Input() masterRow!: AbstractControl;

  @Input() onMainRowSelected: Observable<SelectedMasterRow> =
    new Observable<SelectedMasterRow>();
  
  @Input() rowSelectionFormControlName = '';
  
  @Output() onSelectSubrow = new EventEmitter();

  @Output() onFormUpdate = new EventEmitter<any[]>();
  
  public innerDisplayColumnsProps: string[] = [];

  matTableDataSource: MatTableDataSource<AbstractControl> = new MatTableDataSource<AbstractControl>([]);

  onChangeSubscription: Subscription | undefined;

  public onTouched: Function = () => {};

  public onChanged: (subrowArray: T[]) => void = () => {
  };

  subrowFormArray: FormArray = this.formBuilder.array([]);

  public subrowGroup: FormGroup = this.formBuilder.group({})

  constructor(
    private formBuilder: FormBuilder,
    public dataGridHelperService: DataGridHelperService<T>,
    public rowSelectionService: RowSelectionService) {
  }

  ngOnInit() {
    if (this.subrowSelection) {
      //TODO: set subscription variable and unsubscribe it onDestroy
      this.onMainRowSelected.subscribe((onMainRowSelectedObj: SelectedMasterRow) => {
        if (onMainRowSelectedObj.masterRow === this.masterRow || onMainRowSelectedObj.isMasterToggle) {
          if (onMainRowSelectedObj.isMainRowSelected) {
            this.selectAllRows();
          } else {
            this.rowSelectionService.clearSelectedRows(this.subrowFormArray.controls, this.rowSelectionFormControlName);
          }
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.onChangeSubscription) {
      this.onChangeSubscription.unsubscribe();
    }
  }

  getInnerDisplayColumns(arr: any[]): string[] {
    const arrayFirstElement = arr[0];
    return Object.keys(arrayFirstElement);
  }

  toggleRowSelection(row: FormGroup) {
    this.rowSelectionService.toggleRow(row, this.rowSelectionFormControlName);
    this.onSelectSubrow.emit();
  }

  getSelectedFormArrayElements() {
    return this.rowSelectionService.getSelectedRows(this.matTableDataSource.data, this.rowSelectionFormControlName);
  }

  getSelectedDisplayValue(row: AbstractControl, columnName: string) {
    return this.dataGridHelperService.getSelectedDisplayValue(row.get(columnName)?.value, columnName, this.selectInnerColumnMappingModels);
  }

  getOptionsForColumn(columnName: string) {
    return this.dataGridHelperService.getOptionsForColumn(columnName, this.selectInnerColumnMappingModels)
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: AbstractControl, rowIndex?: number): string {
    if (!row) {
      return '';
    }

    return `${this.rowSelectionService.isRowSelected(row, this.rowSelectionFormControlName) ? 'deselect' : 'select'} row ${rowIndex ?? 0 + 1}`;
  }

  onSubrowSelectionChange(event: any, row: FormGroup): any {
    return event ? this.toggleRowSelection(row) : null;
  }

  isRowSelected(row: AbstractControl): boolean {
    return this.rowSelectionService.isRowSelected(row, this.rowSelectionFormControlName);
  }

  areSelectedRowsValid(): boolean {
    return !this.rowSelectionService.getSelectedRows(this.matTableDataSource.data, this.rowSelectionFormControlName)?.some(r => r.invalid);
  }

  selectAllRows() {
    this.rowSelectionService.selectRows(this.matTableDataSource.data, this.rowSelectionFormControlName);
  }

  buildDisplayColumns(arr: T[]) {
    const firstDataSourceElement = arr[0];

    if (this.innerDisplayColumns.length === 0) {

      if (firstDataSourceElement) {
        this.innerDisplayColumnsProps = Object.keys(firstDataSourceElement);

        this.innerDisplayColumns = this.dataGridHelperService.buildDefaultDisplayColumns(this.innerDisplayColumnsProps, firstDataSourceElement);
      }
    } else {
      this.innerDisplayColumnsProps = this.innerDisplayColumns.map((col: ColumnHeader) => col.name);
    }

    if (this.subrowSelection) {
      this.innerDisplayColumnsProps.unshift('select');
    }
  }

  buildArrayElementFormGroup(element: T) {
    let arrayElementFormGroupObj: any = {};

    Object.keys(element).forEach((key: string) => {
      arrayElementFormGroupObj[key] = this.formBuilder.control((element as any)[key]);
    });
    
    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormGroupObj);

    return arrayElementFormGroup;
  }

  //Required by the signature of: ControlValueAccessor
  writeValue(val: any): void {
    if (!val) {
      return;
    }

    const arrayKey: any = Object.keys(val).find(key => (val[key]).constructor === Array);
    const arr = val[arrayKey];

    this.subrowFormArray = this.formBuilder.array(
      arr.map((x: T) => { 
        return this.buildArrayElementFormGroup(x); 
      })
    );

    this.subrowGroup.setControl(this.subrowArrayPropName, this.subrowFormArray, { emitEvent: false });
    
    this.buildDisplayColumns(arr);

    // this.subrowDataSource = arr;
    this.matTableDataSource = new MatTableDataSource<AbstractControl>(this.subrowFormArray.controls);
	}

  //Required by the signature of: ControlValueAccessor
	registerOnChange(onChange: any) {
    this.onChangeSubscription = this.subrowGroup.valueChanges.subscribe(onChange);
  }

  //Required by the signature of: ControlValueAccessor
	registerOnTouched(fn: Function): void {
		this.onTouched = fn;
	}

  //Required by the signature of: ControlValueAccessor
	setDisabledState?(isDisabled: boolean): void {
		isDisabled ? this.subrowGroup.disable() : this.subrowGroup.enable();
	}

  //Required by the signature of: ControlValueAccessor
	validate(control: AbstractControl): ValidationErrors | null {
    return control.errors;
	}

  //Required by the signature of: ControlValueAccessor
	registerOnValidatorChange?(fn: () => void): void { }
}
