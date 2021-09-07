import { Component, forwardRef, OnInit, OnDestroy, Input } from '@angular/core';
import {
  FormGroup,
	FormBuilder,
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
	Validator,
	NG_VALIDATORS,
	AbstractControl,
	ValidationErrors
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectOption, SelectColumnMappingModel } from '../../models/select-models';

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
  
  public innerDisplayColumnsProps: string[] = [];

  public subrowDataSource: T[] = [];

  onChangeSubscription: Subscription | undefined;

  public onTouched: Function = () => {};

  public onChanged: (subrowArray: T[]) => void = () => {
  };

  public subrowGroup: FormGroup = this.formBuilder.group({})

  constructor(private formBuilder: FormBuilder, private dataGridHelperService: DataGridHelperService<T>) {
  }

  ngOnInit() {
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

  getOptionsForColumn(columnName: string): SelectOption[] {
    return this.selectInnerColumnMappingModels.find(scmm => scmm.columnName === columnName)
      ?.selectOptions
      .sort((a, b) => a.displayOrder - b.displayOrder) ?? [];
  }

  getSelectedDisplayValue(key: number | string | undefined, columnName: string): string | undefined {
    const colOptions = this.getOptionsForColumn(columnName);
    return colOptions.find(co => co.key === key)?.displayValue;
  }

	writeValue(val: any): void {
    if (!val) {
      return;
    }

    const arrayKey: any = Object.keys(val).find(key => (val[key]).constructor === Array);
    const arr = val[arrayKey];

    const subrowArray = this.formBuilder.array(
      arr.map((x: T) => { 
        return this.buildArrayElementFormGroup(x); 
      })
    );

    this.subrowGroup.setControl(this.subrowArrayPropName, subrowArray, { emitEvent: false });
    
    this.buildDisplayColumns(arr);

    this.subrowDataSource = arr;
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
  }

  buildArrayElementFormGroup(element: T) {
    let arrayElementFormGroupObj: any = {};

    Object.keys(element).forEach((key: string) => {
      arrayElementFormGroupObj[key] = this.formBuilder.control((element as any)[key]);
    });
    
    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormGroupObj);
    return arrayElementFormGroup;
  }

	registerOnChange(onChange: any) {
    this.onChangeSubscription = this.subrowGroup.valueChanges.subscribe(onChange);
  }

	registerOnTouched(fn: Function): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		isDisabled ? this.subrowGroup.disable() : this.subrowGroup.enable();
	}

	validate(control: AbstractControl): ValidationErrors | null {
    return control.errors;
	}

	registerOnValidatorChange?(fn: () => void): void { }
}
