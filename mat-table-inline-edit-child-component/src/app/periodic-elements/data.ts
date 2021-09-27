import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { PeriodicElement } from './models/periodic-element';
import { ColumnHeader } from '../data-grid/models/column-header';
import { SelectColumnMappingModel } from '../data-grid/models/select-models';
import { Isotope } from './models/isotope';
import { ValidationObject } from '../data-grid/models/validation-object';

export const PERIODIC_ELEMENTS_COLUMNS_DATA: ColumnHeader[] = [
  {
      name: 'position',
      displayName: 'Position',
      isEditable: false,
      isVisible: true,
      validators: [],
      propertyType: 'number'
  },
  {
      name: 'name',
      displayName: 'Name',
      isEditable: true,
      isVisible: true,
      validators: [
        new ValidationObject(Validators.required, 'required', 'The field is required'),
        new ValidationObject(Validators.maxLength(15), 'maxlength', 'The field exceeded max length: 15'),
        new ValidationObject(forbiddenNameValidator(/bob/i), 'forbiddenName', "The name should not contain 'bob'")
      ],
      propertyType: 'text'
  },
  {
      name: 'weight',
      displayName: 'Weight',
      isEditable: true,
      isVisible: true,
      validators: [],
      propertyType: 'number'
  },
  {
    name: 'isGas',
    displayName: 'Is Gas',
    isEditable: true,
    isVisible: true,
    validators: [],
    propertyType: 'boolean'
  },
  {
    name: 'discoveredOn',
    displayName: 'Discovery Date',
    isEditable: true,
    isVisible: true,
    validators: [],
    propertyType: 'date'
  },
  {
    name: 'classificationId',
    displayName: 'Classification',
    isEditable: true,
    isVisible: true,
    validators: [],
    propertyType: 'select'
  },
  {
    name: 'isotopes',
    displayName: '',
    isEditable: false,
    isVisible: false,
    validators: [],
    propertyType: 'array',
    hasSubrowArray: true
  }
];

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  };
}

export const PERIODIC_ELEMENTS_INNER_COLUMNS_DATA: ColumnHeader[] = [
  {
      name: 'name',
      displayName: 'Name',
      isEditable: true,
      isVisible: true,
      validators: [
        new ValidationObject(Validators.required, 'required', 'The field is required'),
        new ValidationObject(Validators.maxLength(15), 'maxlength', 'The field exceeded max length: 15'),
        new ValidationObject(forbiddenNameValidator(/bob/i), 'forbiddenName', "The name should not contain 'bob'")
      ],
      propertyType: 'text'
  },
  {
      name: 'protons',
      displayName: 'Protons',
      isEditable: true,
      isVisible: true,
      validators: [],
      propertyType: 'number'
  },
  {
      name: 'neutrons',
      displayName: 'Neutrons',
      isEditable: true,
      isVisible: true,
      validators: [],
      propertyType: 'number'
  },
  {
    name: 'discoveredOn',
    displayName: 'Discovery Date',
    isEditable: true,
    isVisible: true,
    validators: [],
    propertyType: 'date'
  },
  {
    name: 'classificationId',
    displayName: 'Classification',
    isEditable: true,
    isVisible: true,
    validators: [],
    propertyType: 'select'
  }
];

// -----------------------------

export const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    isGas: true,
    discoveredOn: new Date('2021-09-07'),
    classificationId: 4,
    isotopes: [
    {
      name: 'Protium',
      protons: 1, 
      neutrons: 0,
      discoveredOn: new Date('2014-07-16'),
      classificationId: 1
    },
    {
      name: 'Deuterium',
      protons: 1, 
      neutrons: 1,
      discoveredOn: new Date('2021-06-03'),
      classificationId: 1
    },
    {
      name: 'Tritium',
      protons: 1, 
      neutrons: 2,
      discoveredOn: new Date('2021-03-15'),
      classificationId: 2
    }]
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    isGas: true,
    discoveredOn: new Date('2021-11-23'),
    classificationId: 4,
    isotopes: [
    {
      name: 'Helium-2 (diproton)',
      protons: 2, 
      neutrons: 0,
      discoveredOn: new Date('2003-01-22'),
      classificationId: 1
    },
    {
      name: 'Helium-3',
      protons: 2, 
      neutrons: 1,
      discoveredOn: new Date('2021-03-15'),
      classificationId: 2
    },
    {
      name: 'Helium-4',
      protons: 2, 
      neutrons: 2,
      discoveredOn: new Date('2011-04-17'),
      classificationId: 1
    }]
  },
  {
    position: 3,
    name: 'Lithium',
    classificationId: 1,
    weight: 6.94,
    isGas: false,
    discoveredOn: new Date('1998-11-17'),
    isotopes: []
  },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.012,
    isGas: false,
    discoveredOn: new Date('1942-03-18'),
    classificationId: 1,
    isotopes: [
    {
      name: 'Be-6',
      protons: 4, 
      neutrons: 2,
      discoveredOn: new Date('1923-08-15'),
      classificationId: 2
    },
    {
      name: 'Be-8',
      protons: 4, 
      neutrons: 4,
      discoveredOn: new Date('1965-07-27'),
      classificationId: 2
    },
    {
      name: 'Be-9',
      protons: 4, 
      neutrons: 5,
      discoveredOn: new Date('2002-01-09'),
      classificationId: 3
    }]
  },
  {
    position: 5,
    name: 'Boron',
    weight: 10.806,
    isGas: false,
    discoveredOn: new Date('1942-03-18'),
    classificationId: 1,
    isotopes: [
    {
      name: 'B-10',
      protons: 5, 
      neutrons: 5,
      discoveredOn: new Date('1915-11-09'),
      classificationId: 2
    },
    {
      name: 'B-11',
      protons: 5,
      neutrons: 6,
      discoveredOn: new Date('1978-03-08'),
      classificationId: 2
    }]
  },
  {
    position: 6,
    name: 'Carbon',
    weight: 12.0096,
    isGas: false,
    discoveredOn: new Date('1864-09-15'),
    classificationId: 2,
    isotopes: [
    {
      name: 'C-11',
      protons: 6, 
      neutrons: 5,
      discoveredOn: new Date('1899-04-15'),
      classificationId: 1
    },
    {
      name: 'C-12',
      protons: 6,
      neutrons: 6,
      discoveredOn: new Date('1923-11-14'),
      classificationId: 1
    },
    {
      name: 'C-13',
      protons: 6,
      neutrons: 7,
      discoveredOn: new Date('1941-02-19'),
      classificationId: 1
    },
    {
      name: 'C-14',
      protons: 6,
      neutrons: 8,
      discoveredOn: new Date('1888-11-11'),
      classificationId: 2
    }]
  },
  {
    position: 7,
    name: 'Nitrogen',
    weight: 14.006,
    isGas: true,
    discoveredOn: new Date('1911-08-23'),
    classificationId: 4,
    isotopes: [
    {
      name: 'N-13',
      protons: 7, 
      neutrons: 6,
      discoveredOn: new Date('1918-02-22'),
      classificationId: 1
    },
    {
      name: 'N-14',
      protons: 7,
      neutrons: 7,
      discoveredOn: new Date('1909-03-19'),
      classificationId: 1
    },
    {
      name: 'N-15',
      protons: 7,
      neutrons: 8,
      discoveredOn: new Date('1922-05-23'),
      classificationId: 1
    }]
  },
  {
    position: 8,
    name: 'Oxygen',
    weight: 15.999,
    isGas: true,
    discoveredOn: new Date('1893-02-23'),
    classificationId: 4,
    isotopes: [
    {
      name: 'O-16',
      protons: 8, 
      neutrons: 8,
      discoveredOn: new Date('1903-06-14'),
      classificationId: 1
    },
    {
      name: 'O-17',
      protons: 8,
      neutrons: 9,
      discoveredOn: new Date('1901-07-30'),
      classificationId: 1
    },
    {
      name: 'O-18',
      protons: 8,
      neutrons: 10,
      discoveredOn: new Date('1932-02-18'),
      classificationId: 1
    }]
  },
  {
    position: 9,
    name: 'Fluorine',
    weight: 18.998,
    isGas: true,
    discoveredOn: new Date('1843-09-21'),
    classificationId: 3,
    isotopes: [
    {
      name: 'F-18',
      protons: 9, 
      neutrons: 9,
      discoveredOn: new Date('1932-04-01'),
      classificationId: 1
    },
    {
      name: 'F-19',
      protons: 9,
      neutrons: 10,
      discoveredOn: new Date('1956-01-06'),
      classificationId: 1
    }]
  },
  {
    position: 10,
    name: 'Neon',
    weight: 20.1797,
    isGas: true,
    discoveredOn: new Date('1872-11-17'),
    classificationId: 3,
    isotopes: [
    {
      name: 'Ne-20',
      protons: 10, 
      neutrons: 10,
      discoveredOn: new Date('1921-02-16'),
      classificationId: 1
    },
    {
      name: 'Ne-21',
      protons: 10,
      neutrons: 11,
      discoveredOn: new Date('1901-01-01'),
      classificationId: 1
    },
    {
      name: 'Ne-22',
      protons: 10,
      neutrons: 12,
      discoveredOn: new Date('1977-02-12'),
      classificationId: 1
    }]
  }
];

export const PERIODIC_ELEMENTS_SELECT_MODELS: SelectColumnMappingModel[] = [
  {
    columnName: 'classificationId',
    selectOptions: [
      {
        key: 1,
        displayValue: 'metal',
        displayOrder: 1
      },
      {
        key: 2,
        displayValue: 'non-metal',
        displayOrder: 2
      },
      {
        key: 3,
        displayValue: 'halogen',
        displayOrder: 3
      },
      {
        key: 4,
        displayValue: 'nobel gas',
        displayOrder: 4
      }
    ]
  }
];

export const ELEMENTS_FOR_ADDITION: PeriodicElement[] = [
  {
    position: 11,
    name: 'Sodium',
    weight: 22.989,
    isGas: false,
    discoveredOn: new Date('1919-02-25'),
    classificationId: 1,
    isotopes: [
    {
      name: 'Na-22',
      protons: 11, 
      neutrons: 11,
      discoveredOn: new Date('1934-11-29'),
      classificationId: 1
    },
    {
      name: 'Na-23',
      protons: 11, 
      neutrons: 12,
      discoveredOn: new Date('1962-04-11'),
      classificationId: 1
    },
    {
      name: 'Na-24',
      protons: 11, 
      neutrons: 13,
      discoveredOn: new Date('1971-11-01'),
      classificationId: 1
    }]
  }
];

export const PERIODIC_ELEMENTS_INNER_SELECT_MODELS: SelectColumnMappingModel[] = [
  {
    columnName: 'classificationId',
    selectOptions: [
      {
        key: 1,
        displayValue: 'stable',
        displayOrder: 1
      },
      {
        key: 2,
        displayValue: 'radioactive',
        displayOrder: 2
      }
    ]
  }
]

export const ISOTOPES_FOR_ADDITION: Isotope[] = [
  {
    name: 'Mg-24',
    protons: 12, 
    neutrons: 12,
    discoveredOn: new Date('1952-03-12'),
    classificationId: 1
  },
  {
    name: 'Mg-25',
    protons: 12, 
    neutrons: 13,
    discoveredOn: new Date('1912-06-15'),
    classificationId: 1
  },
  {
    name: 'Mg-26',
    protons: 12, 
    neutrons: 14,
    discoveredOn: new Date('1933-01-17'),
    classificationId: 1
  }
]
