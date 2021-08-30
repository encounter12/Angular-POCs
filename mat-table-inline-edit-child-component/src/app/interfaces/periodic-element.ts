import { MatTableDataSource } from '@angular/material/table';
import { Isotope } from "./isotope";

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    isotopes: Isotope[];
}
  