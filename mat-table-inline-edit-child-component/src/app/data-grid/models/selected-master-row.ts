import { FormGroup } from "@angular/forms";

export class SelectedMasterRow {
    public isMainRowSelected: boolean = false;
    public masterRow: FormGroup | undefined;
    public isMasterToggle: boolean = false;

    constructor (isMainRowSelected: boolean, masterRow: FormGroup | undefined, isMasterToggle: boolean) {
        this.isMainRowSelected = isMainRowSelected;
        this.masterRow = masterRow;
        this.isMasterToggle = isMasterToggle;
    }
}
