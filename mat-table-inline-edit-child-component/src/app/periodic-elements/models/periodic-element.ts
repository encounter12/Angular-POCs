import { Isotope } from "./isotope";

export class PeriodicElement {
    public name: string | undefined;
    public position: number | undefined;
    public weight: number | undefined;
    public isGas: boolean | undefined;
    public discoveredOn: Date | undefined;
    public isotopes: Isotope[] = []; 
}
