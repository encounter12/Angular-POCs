export class SelectColumnMappingModel {
    public columnName: string = '';
    public selectOptions: SelectOption[] = [];
}

export class SelectOption {
    public key: number | undefined;
    public displayValue: string | undefined;
    public displayOrder!: number;
}