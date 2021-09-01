import { PeriodicElement } from '../interfaces/periodic-element';
import { ColumnHeader } from '../models/column-header';

export const PERIODIC_ELEMENTS_COLUMNS_DATA: ColumnHeader[] = [
    {
        name: 'position',
        displayName: 'Position',
        isEditable: false,
        isVisible: true,
        validators: []
    },
    {
        name: 'name',
        displayName: 'Name',
        isEditable: true,
        isVisible: true,
        validators: []
    },
    {
        name: 'weight',
        displayName: 'Weight',
        isEditable: true,
        isVisible: true,
        validators: []
    }
];

export const PERIODIC_ELEMENTS_INNER_COLUMNS_DATA: ColumnHeader[] = [
    {
        name: 'name',
        displayName: 'Name',
        isEditable: true,
        isVisible: true,
        validators: []
    },
    {
        name: 'protons',
        displayName: 'Protons',
        isEditable: true,
        isVisible: true,
        validators: []
    },
    {
        name: 'neutrons',
        displayName: 'Neutrons',
        isEditable: true,
        isVisible: true,
        validators: []
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