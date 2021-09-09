export class SelectedFormArrayElement {
    public index!: number;

    public subrowFormArrayElements: SelectedFormArrayElement[] = [];
    
    constructor(index: number, subrowFormArrayElements: SelectedFormArrayElement[]) {
        this.index = index;
        this.subrowFormArrayElements = subrowFormArrayElements;
    }
}
