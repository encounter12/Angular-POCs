import { Injectable } from '@angular/core';

import { ColumnHeader } from "../models/column-header";

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
}