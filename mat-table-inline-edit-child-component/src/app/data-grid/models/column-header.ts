import { ValidationObject } from "./validation-object";

export class ColumnHeader {
    public name: string = '';

    public displayName: string = '';

    public isEditable: boolean = false;

    public isVisible: boolean = true;

    public validators: ValidationObject[] = [];

    public propertyType: string = '';

    public hasSubrowArray?: boolean = false;
}