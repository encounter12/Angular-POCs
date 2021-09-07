import { PeriodicElement } from './models/periodic-element';
import { ColumnHeader } from '../data-grid/models/column-header';

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
  }
];

export const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    isGas: true,
    discoveredOn: new Date('2021-09-07'),
    isotopes: [
    {
     name: 'Protium',
     protons: 1, 
     neutrons: 0,
     discoveredOn: new Date('2014-07-16')
    },
    {
      name: 'Deuterium',
      protons: 1, 
      neutrons: 1,
      discoveredOn: new Date('2021-06-03')
    },
    {
      name: 'Tritium',
      protons: 1, 
      neutrons: 2,
      discoveredOn: new Date('2021-03-15')
    }]
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    isGas: true,
    discoveredOn: new Date('2021-11-23'),
    isotopes: [
    {
      name: 'Helium-2 (diproton)',
      protons: 2, 
      neutrons: 0,
      discoveredOn: new Date('2003-01-22')
    },
    {
      name: 'Helium-3',
      protons: 2, 
      neutrons: 1,
      discoveredOn: new Date('2021-03-15')
    },
    {
      name: 'Helium-4',
      protons: 2, 
      neutrons: 2,
      discoveredOn: new Date('2011-04-17')
    }]
  },
  {
    position: 3,
    name: 'Lithium',
    weight: 6.94,
    isGas: false,
    discoveredOn: new Date('1998-11-17'),
    isotopes: []
  }
];