import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { ColumnHeader } from "../models/column-header";
import { SelectOption, SelectColumnMappingModel } from '../models/select-models';

@Injectable({
  providedIn: 'root',
})
export class DataGridHelperService<T> {
    constructor() {}

    public buildDefaultDisplayColumns(colNames: string[], element: T): ColumnHeader[] {
        let defaultDisplayColumns: ColumnHeader[] = [];

        colNames.forEach((colName) => {
            const columnHeader: ColumnHeader = {
                name: colName,
                displayName: this.formatDisplayName(colName),
                isVisible: true,
                isEditable: false,
                validators: [],
                propertyType: this.getPropertyType((element as any)[colName])
            };

            defaultDisplayColumns.push(columnHeader);
        });

        return defaultDisplayColumns;
    }

    private getPropertyType(propertyValue: any): string {
        const propValueType = typeof propertyValue;
        let outputValueType: string = '';

        switch (propValueType) {
            case 'string':
            outputValueType = 'text';
            break;
            case 'number':
            outputValueType = 'number'
            break;
            default:
            outputValueType = 'text';
        }

        return outputValueType;
    }

    private formatDisplayName(displayName: string): string {
        let result = displayName.trim();
        return this.capitalizeFirstLetter(result);
    }

    private capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public range(size:number, startAt:number = 0): Array<number> {
        return [...Array(size).keys()].map(i => i + startAt);
    }

    public getOptionsForColumn(columnName: string, selectColumnMappingModels: SelectColumnMappingModel[]): SelectOption[] {
        return selectColumnMappingModels.find(scmm => scmm.columnName === columnName)
            ?.selectOptions
            .sort((a, b) => a.displayOrder - b.displayOrder) ?? [];
    }

    public getSelectedDisplayValue(
        key: number | string | undefined,
        columnName: string,
        selectColumnMappingModels: SelectColumnMappingModel[]): string | undefined {
            const colOptions = this.getOptionsForColumn(columnName, selectColumnMappingModels);
            return colOptions.find(co => co.key === key)?.displayValue;
    }

    public setDatePickerForColumns(
        date: Date | null | undefined,
        updatableByMasterDateColumns: string[],
        innerUpdatableByMasterDateColumns: string[],
        expandedDetailFormControlName: string,
        matTableDataSource: MatTableDataSource<AbstractControl>) {
            const rowsOnPage = this.getCurrentPageRows(matTableDataSource);

            rowsOnPage.forEach((row: AbstractControl) => {
                const rowFormGroup = row as FormGroup;

                updatableByMasterDateColumns.forEach((columnName: string) => {
                    const rowDateControl = rowFormGroup.get(columnName);
                    rowDateControl?.setValue(date);
                });

                if (expandedDetailFormControlName && expandedDetailFormControlName.length > 0 && innerUpdatableByMasterDateColumns.length > 0) {
                    this.setDatesForExpandedDetailSubrows(date, rowFormGroup, expandedDetailFormControlName, innerUpdatableByMasterDateColumns);
                } 
            });
    }

    private setDatesForExpandedDetailSubrows(
        date: Date | null | undefined,
        row: FormGroup,
        expandedDetailFormControlName: string,
        innerUpdatableByMasterDateColumns: string[]): void {
            let expandedDetail = row.get(expandedDetailFormControlName) as FormControl;

            let expandedDetailArray = Array.from(expandedDetail?.value[expandedDetailFormControlName]) as Record<string, unknown>[];

            expandedDetailArray?.forEach((subrow: Record<string, unknown>) => {

                innerUpdatableByMasterDateColumns.forEach((columnName: string) => {
                    if (subrow[columnName]) {
                        subrow[columnName] = date;
                    }
                });
            });

            let expandedDetailObj: any = {};
            expandedDetailObj[expandedDetailFormControlName] = expandedDetailArray;
            expandedDetail.setValue(expandedDetailObj);
    }

    getCurrentPageRows(matTableDataSource: MatTableDataSource<AbstractControl>) {
        return matTableDataSource.connect().value;
    }
}