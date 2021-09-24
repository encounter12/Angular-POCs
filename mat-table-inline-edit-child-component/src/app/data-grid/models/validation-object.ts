import { ValidatorFn } from "@angular/forms";

export class ValidationObject {
    private _error: string = '';

    public validator: ValidatorFn;
    public name: string = '';
    public errorVariablesMap: Map<string, string> = new Map<string, string>();

    public get error(): string {
        return this._error;
    }

    constructor(validator: ValidatorFn, validatorName: string, errorTemplate: string, errorVariablesMap?: Map<string, string>) {
        this.validator = validator;
        this._error = this.buildErrorMessage(errorTemplate, errorVariablesMap);
        this.name = validatorName;
    }

    public buildErrorMessage(errorTemplate: string, errorVariablesMap: Map<string, string> | undefined | null): string {
        let errorMessage = errorTemplate;

        if (errorVariablesMap) {
            for (const [key, value] of errorVariablesMap.entries()) {
                errorMessage = errorMessage.replace(key, value);
            }
        }

        return errorMessage;
    }
}