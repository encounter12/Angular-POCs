import { Component, forwardRef, Input, OnInit, ChangeDetectorRef } from '@angular/core';

import { Isotope } from 'src/app/interfaces/isotope';

import {
  FormGroup,
	FormBuilder,
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
	FormGroupDirective,
	Validator,
	NG_VALIDATORS,
	AbstractControl,
	ValidationErrors
} from '@angular/forms';

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
export class RowDetailsComponent implements OnInit, ControlValueAccessor, Validator {
  public innerDisplayColumns: string[] = [];

  public isotopes: Isotope[] = [];

  public onTouched: () => void = () => {
  };

  public onChanged: (isotope: Isotope[]) => void = () => {
  };

  public isotopesGroup: FormGroup = this.formBuilder.group({ 
    isotopesArray: this.formBuilder.array([])
  })

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
     this.isotopesGroup.valueChanges.subscribe((isotopesArray: Isotope[]) => {
      this.onChanged(isotopesArray);
    });
  }

  getInnerDisplayColumns(): string[] {
    const firstElement = this.isotopesGroup.get('isotopesArray')?.value[0];
    return Object.keys(firstElement);
  }

	writeValue(val: Isotope[]): void {
    if (!val) {
      return;
    }

    if (this.isotopesGroup.get('isotopesArray')?.value.length > 0) {
      return;
    }

    const isotopeArray = this.formBuilder.array(
      val.map((x: any) => {
        return this.formBuilder.group({
          name: this.formBuilder.control(x.name),
          protons: this.formBuilder.control(x.protons),
          neutrons: this.formBuilder.control(x.neutrons)
        });
      })
    );

    this.isotopesGroup.setControl('isotopesArray', isotopeArray, { emitEvent: false });

    this.isotopes = this.isotopesGroup.get('isotopesArray')?.value;

    this.innerDisplayColumns = this.getInnerDisplayColumns();
	}

	registerOnChange(fn: any): void {
    this.onChanged = fn;
	}

	registerOnTouched(fn: any): void {
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
