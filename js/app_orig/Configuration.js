'use strict';

STIBO.Timesheet = STIBO.Timesheet || {};
STIBO.Timesheet.Configuration = STIBO.Timesheet.Configuration || {};

STIBO.Timesheet.Configuration.machines = {
    locations: {
        'ROT': [
            { id: 'M4', name: 'M4' },
            { id: 'M5', name: 'M5' },
            { id: 'M6', name: 'M6' },
            { id: 'M7', name: 'M7' },
            { id: 'LAGER', name: 'Lager' }
        ],
        'ARK': []
    },
    getLocation: function ( location ) {
        return this.locations[location];
    }
};

STIBO.Timesheet.Configuration.shifts = {
    locations: {
        'ROT': [
            { id: 'DAG38', title: 'Dag hold', hours: 28, factor: 0.97 },
            { id: 'AFTEN', title: 'Aften hold', hours: 38, factor: 0.97 },
            { id: 'NAT', title: 'Nat hold', hours: 32, factor: 1.16 },
            { id: 'WE1', title: 'Week end 1', hours: 28, factor: 1.32 },
            { id: 'WE2', title: 'Week end 2', hours: 28, factor: 1.32 },
            { id: 'WE24', title: 'Week end', hours: 24, factor: 1.55 },
            { id: 'DAG36', title: 'Dag hold', hours: 36, factor: 1.03 },
            { id: 'DAG37', title: 'Dag hold', hours: 37, factor: 1.00 }
        ],
        'ARK': []
    },
    getLocation: function ( location ) {
        return this.locations[location];
    }
};

STIBO.Timesheet.Configuration.lines = {
    locations: {
        'ROT': [
            { type: 'A', description: 'Timer paa arbejdet inkl. overarbejde' },
            { type: 'B', description: 'Forlaegningstillaeg', includeInColumnSum: false, sumColumn: false }, // sumColumn is obsolete!
            { type: 'C', description: 'Overarbejde 100%' },
            { type: 'D', description: 'Hensat til afspadsering', includeInColumnSum: false, sumColumn: false },
            { type: 'E', description: 'Afspadserede timer' },
            { type: 'F', description: 'Afsp. Genetimer' },
            { type: 'G', description: 'Ferie' },
            { type: 'H', description: 'Feriefridage' },
            { type: 'I', description: 'Soen-/helligdage' },
            { type: 'J', description: 'Egen sygdom' },
            { type: 'K', description: 'Barn syg' }
        ],
        'ARK': null
    },
    getLocation: function ( location ) {
        return this.locations[location];
    },
    getLine: function ( location, type ) {
        return STIBO.utils.find( this.locations[location], 'type', type );
    }
};

// Dette er der altså ikke tid til!! Brug det der er!
//STIBO.Timesheet.Configuration.locations = {
//    'ROT': {
//        machines: [],
//        shifts: [],
//        lines:[]
//    },
//    'ARK': {}
//}



STIBO.utils = STIBO.utils || {};

// Find an object in an array by comparing a specified field with a value.
STIBO.utils.find = function ( arCollection, sField, aValue ) {
    return _.find(
        arCollection,
        function ( element ) {
            return element[sField] === aValue;
        }
    );
}

// Return null (or defaultvalue) if the value is undefined. Else returns the value.
STIBO.utils.default = function ( value, defaultValue ) {
    return _.isUndefined( value ) ?
        ( _.isUndefined( defaultValue ) ? null : defaultValue ) :
        value;
};

// Takes output from a parseFloat() function  and checks/converts...
STIBO.utils.toNumber = function ( value, decimals, round ) {

    if ( _.isNaN || !_.isNumber( value ) )
        return 0.00;

    return value.toFixed( 2 );
};