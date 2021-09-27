import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class RowSelectionService {
    constructor() {}

    public selectRows(rows: AbstractControl[], formControlName: string, expandedDetailFormControlName: string | undefined) {
        for (let row of rows) {
            this.selectRow(row, formControlName, expandedDetailFormControlName);
        }
    }

    clearSelectedRows(rows: AbstractControl[], formControlName: string, expandedDetailFormControlName: string | undefined) {
        for (let control of rows) {
            const isRowSelected = (control.get(formControlName)?.value as boolean);

            if (isRowSelected) {
                this.unselectRow(control,formControlName, expandedDetailFormControlName)
            }
        }
    }

    getSelectedRows(rows: AbstractControl[], formControlName: string) {
        return rows.filter(x => x.get(formControlName)?.value);
    }

    selectRow(row: AbstractControl, formControlName: string, expandedDetailFormControlName: string | undefined) {
        const rowSelectFormControl: AbstractControl | null = row.get(formControlName);
        rowSelectFormControl?.setValue(true);

        if (expandedDetailFormControlName && expandedDetailFormControlName.length > 0) {
            this.selectExpandedDetailSubrows(row, formControlName, expandedDetailFormControlName);
        }
    }

    unselectRow(row: AbstractControl, formControlName: string, expandedDetailFormControlName: string | undefined) {
        const rowSelectFormControl = row.get(formControlName);
        rowSelectFormControl?.setValue(false);

        if (expandedDetailFormControlName && expandedDetailFormControlName.length > 0) {
            this.unselectExpandedDetailSubrows(row, formControlName, expandedDetailFormControlName);
        }
    }

    private selectExpandedDetailSubrows(row: AbstractControl, formControlName: string, expandedDetailFormControlName: string): void {
        let expandedDetail = row.get(expandedDetailFormControlName) as FormControl;

        let expandedDetailArray = Array.from(expandedDetail?.value[expandedDetailFormControlName]);

        let result = expandedDetailArray?.map((el: any) => {
            el[formControlName] = true;
            return el;
        });

        let expandedDetailObj: any = {};
        expandedDetailObj[expandedDetailFormControlName] = result;

        expandedDetail.setValue(expandedDetailObj);
    }

    private unselectExpandedDetailSubrows(row: AbstractControl, formControlName: string, expandedDetailFormControlName: string): void {
        let expandedDetail = row.get(expandedDetailFormControlName) as FormControl;

        let expandedDetailArray = Array.from(expandedDetail?.value[expandedDetailFormControlName]);

        let result = expandedDetailArray?.map((el: any) => {
            el[formControlName] = false;
            return el;
        })

        let expandedDetailObj: any = {};
        expandedDetailObj[expandedDetailFormControlName] = result;

        expandedDetail.setValue(expandedDetailObj);
    }

    toggleRow(row: AbstractControl, formControlName: string, expandedDetailFormControlName: string | undefined) {
        const isRowSelected = row.get(formControlName)?.value as boolean;

        if (isRowSelected) {
            this.unselectRow(row, formControlName, expandedDetailFormControlName);
        } else {
            this.selectRow(row, formControlName, expandedDetailFormControlName);
        }
    }

    isRowSelected(row: AbstractControl, formControlName: string) {
        return row.get(formControlName)?.value;
    }

    hasSelectedRow(rows: AbstractControl[], formControlName: string) {
        return rows.filter((row: AbstractControl) => row.get(formControlName)?.value).length > 0;
    }

    areAllRowsSelected(rows: AbstractControl[], formControlName: string): boolean {
        return !rows.some((row: AbstractControl) => !row?.get(formControlName)?.value);
    }

    areSelectedRowsValid(allRows: AbstractControl[], rowSelectionFormControlName: string): boolean {
        const selectedRows = this.getSelectedRows(allRows, rowSelectionFormControlName);
        return !selectedRows.some(x => x.invalid);
    }
}