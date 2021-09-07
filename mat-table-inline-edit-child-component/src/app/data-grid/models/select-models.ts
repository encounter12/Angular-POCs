export class SelectColumnMappingModel {
    public columnName: string = '';
    public selectOptions: SelectOption[] = [];
}

export class SelectOption {
    public key: number | string | undefined;
    public displayValue: string | undefined;
    public displayOrder!: number;
}