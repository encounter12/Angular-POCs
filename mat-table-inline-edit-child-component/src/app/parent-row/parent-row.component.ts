import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ColumnHeader } from '../models/column-header';

@Component({
  selector: 'app-parent-row',
  templateUrl: './parent-row.component.html',
  styleUrls: ['./parent-row.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ParentRowComponent<T> implements OnInit {
  @Input() displayColumns: ColumnHeader[] = [];
  @Input() dataSource: T[] = [];

  @Output() onFormUpdate = new EventEmitter<any[]>();

  displayColumnsInternal: ColumnHeader[] = [];
  expandedDetailFormControlName: string = '';
  columnsProps: string[] = [];

  public parentFormFormArray: FormArray = this.formBuilder.array([]);
  public parentFormGroup: FormGroup = this.formBuilder.group({ 'parentFormFormArray': this.parentFormFormArray });

  expandedElement: T | null | undefined;

  constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.dataSource.forEach((pe) => this.addRow(pe));

    const firstDataSourceElement = this.dataSource[0];

    if (firstDataSourceElement) {
      this.expandedDetailFormControlName = Object.keys(firstDataSourceElement)
        .find(key => (firstDataSourceElement as any)[key].constructor === Array) ?? '';
    }

    this.parentFormFormArray.valueChanges.subscribe(() => {
      this.onFormUpdate.emit(this.parentFormFormArray.value);
    })

    if (this.displayColumns.length === 0) {

      if (firstDataSourceElement) {
        this.columnsProps = Object.keys(firstDataSourceElement)
          .filter((key: string) => (firstDataSourceElement as any)[key].constructor !== Array);

        this.displayColumns = this.buildDefaultDisplayColumns(this.columnsProps, firstDataSourceElement);
      }
    } else {
      this.columnsProps = this.displayColumns.map((col: ColumnHeader) => col.name);
    }
  }

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

  getPropertyType(propertyValue: any): string {
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

  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  addRow(rowElement: T) {

    const arrayElementFormObject = this.buildArrayElementFormObject(rowElement);
    const arrayElementFormGroup = this.formBuilder.group(arrayElementFormObject);
    this.parentFormFormArray.push(arrayElementFormGroup);
  }

  buildArrayElementFormObject(rowElement: T): any {
    const arrayElementFormObj: any = {};

    Object.keys(rowElement).forEach((key: string) => {

      const propValue = (rowElement as any)[key];

      if (propValue.constructor === Array) {
        arrayElementFormObj[key] = this.formBuilder.control( { subrowArray: propValue });
      } else {
        arrayElementFormObj[key] = this.formBuilder.control(propValue);
      }
    });

    return arrayElementFormObj;
  }

  toggleRow(rowElement: T) {
    (rowElement as any)[this.expandedDetailFormControlName] && (rowElement as any)[this.expandedDetailFormControlName].length ?
      (this.expandedElement = this.expandedElement === rowElement ? null : rowElement) : null;

    this.changeDetectorRef.detectChanges();
  }
}
