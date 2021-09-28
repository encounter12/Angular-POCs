import { Component, forwardRef, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {
  FormGroup,
	FormBuilder,
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
	Validator,
	NG_VALIDATORS,
	AbstractControl,
	ValidationErrors,
  FormArray,
  ValidatorFn,
  FormControl
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectColumnMappingModel } from '../../models/select-models';

import { MatTableDataSource } from '@angular/material/table';
import { RowSelectionService } from '../../helpers/row-selection-service';
import { ValidationService } from '../../helpers/validation-service';
import { ValidationObject } from '../../models/validation-object';

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
export class RowDetailsComponent<T> implements OnDestroy, ControlValueAccessor, Validator {
  
  @Input() innerDisplayColumns: ColumnHeader[] = [];

  @Input() subrowArrayPropName: string = '';

  @Input() selectInnerColumnMappingModels: SelectColumnMappingModel[] = [];

  @Input() isRowSelectionEnabled: boolean = false;

  @Input() subrowSelection: boolean = false;

  @Input() masterRow!: AbstractControl;
  
  @Input() rowSelectionFormControlName: string = '';
  
  @Output() onSelectSubrow = new EventEmitter();

  @Output() onFormUpdate = new EventEmitter<any[]>();

  @Output() onSubrowAddition = new EventEmitter();
  @Output() onSubrowDeletion = new EventEmitter<T>();
  
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
    public rowSelectionService: RowSelectionService,
    public validationService: ValidationService,
    public crf: ChangeDetectorRef) {
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
    this.rowSelectionService.toggleRow(row, this.rowSelectionFormControlName, undefined);
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

  areSelectedRowsValid(allRows: AbstractControl[], rowSelectionFormControlName: string): boolean {
    return this.rowSelectionService.areSelectedRowsValid(allRows, rowSelectionFormControlName);
  }

  selectAllRows() {
    this.rowSelectionService.selectRows(this.matTableDataSource.data, this.rowSelectionFormControlName, undefined);
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

    this.innerDisplayColumnsProps.push('actions');
  }

  buildArrayElementFormGroup(element: T) {
    let arrayElementFormGroupObj: any = {};

    Object.keys(element).forEach((key: string) => {
      const currentDisplayCol: ColumnHeader | undefined = this.innerDisplayColumns.find(dc => dc.name === key);
      arrayElementFormGroupObj[key] = this.formBuilder.control((element as any)[key], this.buildValidatorsForControl(currentDisplayCol?.validators));
    });

    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormGroupObj);

    return arrayElementFormGroup;
  }

  addNewSubrow() {
    this.onSubrowAddition.emit();
  }

  deleteSubRow(subrow: FormGroup) {
    const subrowObj = this.transformSubrowFormGroupToObject(subrow);
    this.onSubrowDeletion.emit(subrowObj);
  }

  private transformSubrowFormGroupToObject(formGroup: FormGroup): T {
    let selectedElement = JSON.parse(JSON.stringify(formGroup?.value));

    if (this.subrowSelection) {
      delete selectedElement[this.rowSelectionFormControlName];
    }

    return selectedElement;
  }

  public getCellValidationMessage(cellFormControl: AbstractControl, validationObjects: ValidationObject[]): string {
    return this.validationService.getCellValidationMessage(cellFormControl, validationObjects);
  }

  private buildValidatorsForControl(validationObjects: ValidationObject[] | undefined): ValidatorFn[] {
    return this.validationService.buildValidatorsForControl(validationObjects);
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
	registerOnValidatorChange?(fn: () => void): void { }

  //Required by the signature of: Validator
	validate(control: FormControl): ValidationErrors | null {
    let validationErrors: ValidationErrors | null = null;

    let subrowsForValidation: AbstractControl[] = [];

    if (this.subrowSelection) {
      subrowsForValidation = this.rowSelectionService.getSelectedRows(this.subrowFormArray.controls, this.rowSelectionFormControlName);
    } else {
      subrowsForValidation = this.subrowFormArray.controls;
    }

    subrowsForValidation.forEach((control: AbstractControl, index: number) => {
      const arrayElementFormGroup = control as FormGroup;
      let rowValidationErrors: { controlName: string, errors: ValidationErrors | null | undefined }[] = [];
      Object.keys(arrayElementFormGroup.controls).forEach((formControlName: string) => {
        const controlErrors = arrayElementFormGroup.get(formControlName)?.errors;
        if (controlErrors && Object.keys(controlErrors).length > 0) {
          rowValidationErrors.push({ controlName: formControlName, errors: controlErrors });
        }
      });

      if (rowValidationErrors.length > 0) {
        if (validationErrors == null) {
          validationErrors = {};
        }
        validationErrors[index] = rowValidationErrors;
      }
    });

    return validationErrors;
	}
}
