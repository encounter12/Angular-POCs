import { PeriodicElement } from './models/periodic-element';
import { ColumnHeader } from '../data-grid/models/column-header';
import { SelectColumnMappingModel } from '../data-grid/models/select-models';

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
      validators: [],
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

export const PERIODIC_ELEMENTS_INNER_COLUMNS_DATA: ColumnHeader[] = [
  {
      name: 'name',
      displayName: 'Name',
      isEditable: true,
      isVisible: true,
      validators: [],
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
]

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