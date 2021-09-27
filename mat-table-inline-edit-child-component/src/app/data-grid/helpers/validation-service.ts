import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { ValidationObject } from '../models/validation-object';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
    constructor() {}

    public getCellValidationMessage(cellFormControl: AbstractControl, validationObjects: ValidationObject[]) {
        let errors = '';
    
        if (cellFormControl?.errors) {
          const keysWithErrors = Object.keys(cellFormControl.errors).filter(key => cellFormControl.errors?.[key]);
          errors = keysWithErrors.map((key: string) =>
            validationObjects.find(vo => vo.name === key)?.error).join(', ');
        }
    
        return errors;
      }
    
      public buildValidatorsForControl(validationObjects: ValidationObject[] | undefined): ValidatorFn[] {
        let validators: ValidatorFn[] = [];
    
        if (validationObjects) {
          validators = validationObjects.map((vo: ValidationObject) => vo.validator);
        }
    
        return validators;
      }
}