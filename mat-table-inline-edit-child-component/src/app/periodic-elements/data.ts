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
  }
];

export const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    isotopes: [
    {
     name: 'Protium',
     protons: 1, 
     neutrons: 0
    },
    {
      name: 'Deuterium',
      protons: 1, 
      neutrons: 1
    },
    {
      name: 'Tritium',
      protons: 1, 
      neutrons: 2
    }]
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    isotopes: [
    {
      name: 'Helium-2 (diproton)',
      protons: 2, 
      neutrons: 0
    },
    {
      name: 'Helium-3',
      protons: 2, 
      neutrons: 1
    },
    {
      name: 'Helium-4',
      protons: 2, 
      neutrons: 2
    }]
  }
];