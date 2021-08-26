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
  selector: 'app-address-info',
  templateUrl: './address-info.component.html',
  styleUrls: ['./address-info.component.css'],
  providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AddressInfoComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => AddressInfoComponent),
			multi: true
		}
	]
})
export class AddressInfoComponent implements OnInit, ControlValueAccessor, Validator {

  public addressForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private ngForm: FormGroupDirective) {
  }

  ngOnInit() {
    this.addressForm = this.formBuilder.group({
			addressLine: [null, [Validators.required]],
			areacode: [null, [Validators.required, Validators.maxLength(5)]]
		});

		console.log(this.ngForm);
  }

  get addressLine() { return this.addressForm.get('addressLine'); }

  get areacode() { return this.addressForm.get('areacode'); }

  public onTouched: () => void = () => {};

  writeValue(val: any): void {
    val && this.addressForm.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    console.log("on change");
    this.addressForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.addressForm.disable() : this.addressForm.enable();
  }

	validate(control: AbstractControl): ValidationErrors {
		const form = this.addressForm;
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