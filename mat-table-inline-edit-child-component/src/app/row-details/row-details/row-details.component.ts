import { Component, forwardRef, OnDestroy } from '@angular/core';
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

import { Isotope } from 'src/app/interfaces/isotope';

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
export class RowDetailsComponent implements OnDestroy, ControlValueAccessor, Validator {
  public innerDisplayColumns: string[] = [];
  public isotopes: Isotope[] = [];

  onChangeSubscription: Subscription | undefined;

  public onTouched: Function = () => {};

  public onChanged: (isotope: Isotope[]) => void = () => {
  };

  public isotopesGroup: FormGroup = this.formBuilder.group({ 
    isotopesArray: this.formBuilder.array([])
  })

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnDestroy() {
    if (this.onChangeSubscription) {
      this.onChangeSubscription.unsubscribe();
    }
  }

  getInnerDisplayColumns(): string[] {
    const isotopeArrayFirstElement = this.isotopesGroup.get('isotopesArray')?.value[0];
    return Object.keys(isotopeArrayFirstElement);
  }

	writeValue(val: Isotope[]): void {
    if (!val) {
      return;
    }

    const isotopeArray = this.formBuilder.array(
      val.map((x: any) => { 
        return this.buildIsotopeFormGroup(x); 
      })
    );

    this.isotopesGroup.setControl('isotopesArray', isotopeArray, { emitEvent: false });
    
    this.innerDisplayColumns = this.getInnerDisplayColumns();

    this.isotopes = this.isotopesGroup.get('isotopesArray')?.value;
	}

  buildIsotopeFormGroup(isotope: any) {
    let isotopeFormGroupObj: any = {};

    Object.keys(isotope).forEach((key: string) => {
      isotopeFormGroupObj[key] = this.formBuilder.control(isotope[key]);
    });
    
    const isotopeGroup = this.formBuilder.group(isotopeFormGroupObj);
    return isotopeGroup;
  }

	registerOnChange(onChange: any) {
    this.onChangeSubscription = this.isotopesGroup.valueChanges.subscribe(onChange);
  }

	registerOnTouched(fn: Function): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		isDisabled ? this.isotopesGroup.disable() : this.isotopesGroup.enable();
	}

	validate(control: AbstractControl): ValidationErrors | null {
    return control.errors;
	}

	registerOnValidatorChange?(fn: () => void): void { }
}
