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

import { SelectionModel } from '@angular/cdk/collections';

import { Observable, Subscription } from 'rxjs';
import { ColumnHeader } from '../../models/column-header';
import { DataGridHelperService } from '../../helpers/datagrid-helper-service';
import { SelectColumnMappingModel } from '../../models/select-models';

import { SelectedFormArrayElement } from '../../models/selected-form-array-element';

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

  @Input() masterRowIndex!: number;

  @Input() onMainRowSelected: Observable<{ isMainRowSelected: boolean, masterRowIndex: number }> =
    new Observable<{ isMainRowSelected: boolean, masterRowIndex: number }>();

  @Output() onSelectSubrow = new EventEmitter<{ selectedFormArrayElementIndices: SelectedFormArrayElement[], masterRowIndex: number, areSelectedSubrowsValid: boolean}>();

  @Output() onFormUpdate = new EventEmitter<any[]>();

  selection = new SelectionModel<T>(true, []);

  selectedFormArrayElementIndices: SelectedFormArrayElement[] = [];
  selectedFormArrayElements: T[] = [];

  subrowSelectionHasChanged: boolean = false;
  
  public innerDisplayColumnsProps: string[] = [];

  public subrowDataSource: T[] = [];

  onChangeSubscription: Subscription | undefined;

  public onTouched: Function = () => {};

  public onChanged: (subrowArray: T[]) => void = () => {
  };

  subrowFormArray: FormArray = this.formBuilder.array([]);

  public subrowGroup: FormGroup = this.formBuilder.group({})

  constructor(private formBuilder: FormBuilder, public dataGridHelperService: DataGridHelperService<T>) {
  }

  ngOnInit() {

    // const gosho: any = {};
    // gosho[this.subrowArrayPropName] = this.subrowFormArray;
    // this.subrowGroup.setControl(this.subrowArrayPropName, this.subrowFormArray);

    this.subrowFormArray.valueChanges.subscribe(() => {
      this.onFormUpdate.emit(this.subrowFormArray.value);
      if (this.subrowSelection && this.subrowSelectionHasChanged && this.subrowFormArray.valid) {
        // this.updateFormArrayElementsOnRowSelectionChange();
        const areSelectedSubrowsValid = this.areSelectedSubrowsValid();
        this.onSelectSubrow.emit({ 
          selectedFormArrayElementIndices: this.selectedFormArrayElementIndices,
          masterRowIndex: this.masterRowIndex,
          areSelectedSubrowsValid: areSelectedSubrowsValid
        });
      }
    });

    if (this.subrowSelection) {
      this.selection.changed.subscribe((x) => {
        this.subrowSelectionHasChanged = true;
        // this.updateFormArrayElementsOnRowSelectionChange();
        const areSelectedSubrowsValid = this.areSelectedSubrowsValid();
        this.onSelectSubrow.emit({ 
          selectedFormArrayElementIndices: this.selectedFormArrayElementIndices,
          masterRowIndex: this.masterRowIndex,
          areSelectedSubrowsValid: areSelectedSubrowsValid
        });
      });

      //TODO: set subscription variable and unsubscribe it onDestroy
      this.onMainRowSelected.subscribe((onMainRowSelectedObj: { isMainRowSelected: boolean, masterRowIndex: number }) => {
        if (onMainRowSelectedObj.masterRowIndex === this.masterRowIndex) {
          if (!onMainRowSelectedObj.isMainRowSelected) {
            this.clearSelectionForAll();
          } else if (onMainRowSelectedObj.isMainRowSelected) {
            this.selectAllSubrows();
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

  toggleRowSelection(row: any, rowIndex: number) {
    const isSelected = this.selection.isSelected(row);

    if (!isSelected && !this.selectedFormArrayElementIndices.some(x => x.index === rowIndex)) {
      const selectedFormArrayElement = new SelectedFormArrayElement(rowIndex, []);
      this.selectedFormArrayElementIndices.push(selectedFormArrayElement);
    } else if (isSelected && this.selectedFormArrayElementIndices.some(x => x.index === rowIndex)) {
      this.selectedFormArrayElementIndices = this.selectedFormArrayElementIndices.filter(e => e.index !== rowIndex);
    }

    this.selection.toggle(row);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: T, rowIndex?: number): string {
    if (!row) {
      return '';
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${rowIndex ?? 0 + 1}`;
  }

  clearSelectionForAll() {
    this.selectedFormArrayElementIndices = [];
    this.selection.clear();
  }

  onMySelectionChange(event: any, row: T, rowIndex: number) {
    return event ? this.toggleRowSelection(row, rowIndex) : null;
  }

  selectAllSubrows() {
    this.selectedFormArrayElementIndices = this.buildMarkedSelectedFormArrayElements();
    this.selection.select(...this.subrowDataSource);
  }

  buildMarkedSelectedFormArrayElements(): SelectedFormArrayElement[] {
    let selectedFormArrayElementIndices: SelectedFormArrayElement[] = [];

    this.subrowFormArray.value.forEach((el: T, currentIndex: number) => {
      let selectedFormArrayElement = new SelectedFormArrayElement(currentIndex, []);

      selectedFormArrayElementIndices.push(selectedFormArrayElement);
    });

    return selectedFormArrayElementIndices;
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

  areSelectedSubrowsValid(): boolean {
    const areValid = !this.selectedFormArrayElementIndices.some(el => this.subrowFormArray.at(el.index).invalid)
    return areValid;
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

    this.subrowDataSource = arr;
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
