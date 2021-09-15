import { FormGroup } from "@angular/forms";

export class SelectedMasterRow {
    public isMainRowSelected: boolean = false;
    public masterRow: FormGroup | undefined;
    public selectionType: RowSelectionType = RowSelectionType.allRowsDeselected

    constructor (isMainRowSelected: boolean, masterRow: FormGroup | undefined, selectionType: RowSelectionType) {
        this.isMainRowSelected = isMainRowSelected;
        this.masterRow = masterRow;
        this.selectionType = selectionType;
    }
}

export enum RowSelectionType {
    allRowsSelected,
    allRowsDeselected,
    none
}