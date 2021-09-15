import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class RowSelectionService {
    constructor() {}

    public selectRows(rows: AbstractControl[], formControlName: string) {
        for (let row of rows) {
            this.selectRow(row, formControlName);
        }
    }

    clearSelectedRows(rows: AbstractControl[], formControlName: string) {
        for (let control of rows) {
            const isRowSelected = (control.get(formControlName)?.value as boolean);

            if (isRowSelected) {
            control.get(formControlName)?.setValue(false);
            }
        }
    }

    getSelectedRows(rows: AbstractControl[], formControlName: string) {
        return rows.filter(x => x.get(formControlName)?.value);
    }

    selectRow(row: AbstractControl, formControlName: string) {
        row.get(formControlName)?.setValue(true);
    }

    isRowSelected(row: AbstractControl, formControlName: string) {
        return row.get(formControlName)?.value;
    }

    toggleRow(row: AbstractControl, formControlName: string) {
        const isRowSelected = row.get(formControlName)?.value as boolean;

        if (isRowSelected) {
            row.get(formControlName)?.setValue(false);
        } else {
            row.get(formControlName)?.setValue(true);
        }
    }

    hasSelectedRow(rows: AbstractControl[], formControlName: string) {
        return rows.filter((row: AbstractControl) => row.get(formControlName)?.value).length > 0;
    }

    getAllSelectedRowsCount(rows: AbstractControl[], formControlName: string) {
        return rows.filter((row: AbstractControl) => row.get(formControlName)?.value).length;
    }
}