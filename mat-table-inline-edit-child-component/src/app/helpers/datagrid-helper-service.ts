import { Injectable } from '@angular/core';

import { ColumnHeader } from "../models/column-header";

@Injectable({
  providedIn: 'root',
})
export class DataGridHelperService<T> {
    constructor() {}

    buildDefaultDisplayColumns(colNames: string[], element: T): ColumnHeader[] {
        let defaultDisplayColumns: ColumnHeader[] = [];

        colNames.forEach((colName) => {
            const columnHeader: ColumnHeader = {
            name: colName,
            displayName: this.capitalizeFirstLetter(colName),
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

    private capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}