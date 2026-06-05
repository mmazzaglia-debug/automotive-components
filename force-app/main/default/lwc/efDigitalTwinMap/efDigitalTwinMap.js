import { LightningElement } from 'lwc';

export default class EfDigitalTwinMap extends LightningElement {
    mapMarkers = [
        {
            location: {
                // Location Information
                City: 'Gennevilliers',
                Country: 'FR',
                PostalCode: '92230',
                Street: '25 Rue Jules Vallès',
            },
            
            //Shape
  
            // For onmarkerselect
            value: 'SF0',

            // Extra info for tile in list & info window
            icon: 'standard:home',
            title: 'Vehicle Location', // e.g. Account.Name
            description: '',
        }, {
            location: {
                // Location Information
                City: 'Gennevilliers',
                Country: 'FR',
                PostalCode: '92230',
                Street: '37 Av. Lucien Lanternier',
            },

            // For onmarkerselect
            value: 'SF1',

            // Extra info for tile in list & info window
            icon: 'standard:apex_plugin',
            title: 'Access - TotalEnergies', // e.g. Account.Name
            description: 'Gas station',
        },
        {
            location: {
                // Location Information
                City: 'Gennevilliers',
                Country: 'FR',
                PostalCode: '92230',
                Street: '99 Av. Louis Roche',
            },

            // For onmarkerselect
            value: 'SF2',

            // Extra info for tile in list
            icon: 'standard:apex_plugin',
            title: 'ChargeGuru Charging Station', // e.g. Account.Name
            description: 'Electric vehicle charging station',
        },
        {
            location: {
                // Location Information
                City: 'Colombes',
                Country: 'FR',
                PostalCode: '92700',
                Street: '61 Rue du Bournard',
            },

            // For onmarkerselect
            value: 'SF3',

            // Extra info for tile in list
            icon: 'standard:apex_plugin',
            title: 'Stations TIERS Charging Station', // e.g. Account.Name
            description: 'Electric vehicle charging station',
        },
        {
            location: {
                // Location Information
                City: 'Gennevilliers',
                Country: 'FR',
                PostalCode: '92230',
                Street: '169 Av. Gabriel-Péri',
            },

            // For onmarkerselect
            value: 'SF4',

            // Extra info for tile in list
            icon: 'standard:apex_plugin',
            title: 'DRIVECO Charging Station', // e.g. Account.Name
            description: 'Electric vehicle charging station',
        },
    ];

    selectedMarkerValue = 'SF0';

    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
    }
}