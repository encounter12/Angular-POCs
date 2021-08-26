import { Component, OnInit, forwardRef, Input } from '@angular/core';

import {
	FormGroup,
	FormBuilder,
	Validators,
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
	FormGroupDirective,
	Validator,
	NG_VALIDATORS,
	AbstractControl,
	ValidationErrors
} from '@angular/forms';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.css'],
  providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => BasicInfoComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => BasicInfoComponent),
			multi: true
		}
	]
})
export class BasicInfoComponent implements OnInit, ControlValueAccessor, Validator {

  public basicInfoForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private ngForm: FormGroupDirective) {
  }

  ngOnInit() {
    this.basicInfoForm = this.formBuilder.group({
			fname: [null, [Validators.required]],
			email: [null, [Validators.required, Validators.email]]
		});
  }


  get fname() { return this.basicInfoForm.get('fname'); }

  get email() { return this.basicInfoForm.get('email'); }

  public onTouched: () => void = () => {};

  writeValue(val: any): void {
    val && this.basicInfoForm.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    console.log("on change");
    this.basicInfoForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.basicInfoForm.disable() : this.basicInfoForm.enable();
  }

  validate(control: AbstractControl): ValidationErrors {
		const form = this.basicInfoForm;
		if (form.valid) {
			return null;
		}

		const errors = {};
		Object.keys(form.controls).forEach(k => {
			if (form.controls[k].invalid) {
				errors[k] = form.controls[k].errors;
			}
		});

		return errors;
	}

	registerOnValidatorChange?(fn: () => void): void { }
}