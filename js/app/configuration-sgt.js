'use strict';

STIBO.Timesheet = STIBO.Timesheet || {};
STIBO.Timesheet.Configuration = STIBO.Timesheet.Configuration || {};

//STIBO.Timesheet.Settings = {

//    companyCode: 'SGT',     // 20150211 cfi/columbus - Separation between SGT and CPV
//    hoursOnTimesheet: 0,    // 20150211 cfi/columbus - CPV timesheets start with 74 hours and subtract entered hours!

//    debugActive: true,              // REMEMBER - Set to false when LIVE
//    autoSelectCurrentWeek: false,   // not in use
//    dummy: null
//};

STIBO.Timesheet.Configuration.debugActive = false; // REMEMBER - Set to false when LIVE

STIBO.Timesheet.Configuration.companyCode = 'SGT';
STIBO.Timesheet.Configuration.initialHoursOnTimesheet = 0; // CPV timesheets start with 74 hours and subtract entered hours!

// not in use
STIBO.Timesheet.Configuration.states = {
    'BLANK': { title: 'Åben', color: '#ff0000' },
    'OPEN': { title: 'Åben', color: '#ff0000' },
    'SUBMITTED': {},
    'APPROVED': {},
    'APPROVEDTENTATIVE': {},
    'CLOSED': {}
};


STIBO.Timesheet.Configuration.machines = {
    locations: {
        'Rotation': [
            { id: 'M4', name: 'M4', teamId: 'ALL' },
            { id: 'M5', name: 'M5', teamId: 'ALL' },
            { id: 'M6', name: 'M6', teamId: 'ALL' },
            { id: 'M7', name: 'M7', teamId: 'ALL' },
            { id: 'LAGER', name: 'Lager', teamId: 'ALL' }
        ],
        // Bogbind bruger ikke maskiner men er i stedet defineret som hold. Valg af hold bestemmer valgmuligheder for skift.
        'Bogbind': [
            { id: '2H', name: '2-hold (72t)', teamId: '2H' },
            { id: 'FT', name: 'Fast tur', teamId: 'FT' },
            { id: '2HN', name: '2-hold nat', teamId: '2HN' },
            { id: '3H', name: '3-hold (108t)', teamId: '3H' },
            { id: '4H', name: '4-hold (132t)', teamId: '4H' },
            { id: '3HP', name: '3-hold Planskærer (108t)', teamId: '3HP' }
        ]
    },
    getLocation: function ( location ) {
        if ( location.toLowerCase() === 'lager' )
            location = 'Rotation';

        return this.locations[location];
    },
    getMachine: function ( location, id ) {
        if ( location.toLowerCase() === 'lager' )
            location = 'Rotation';

        return STIBO.utils.find(this.locations[location], 'id', id);
    }
};

STIBO.Timesheet.Configuration.shifts = {
    locations: {
        'Rotation': [
            { id: 'DAG38', title: 'Dag hold', hours: 38, factor: 0.97, teamId: 'ALL' },
            { id: 'AFTEN', title: 'Aften hold', hours: 38, factor: 0.97, teamId: 'ALL' },
            { id: 'NAT', title: 'Nat hold', hours: 32, factor: 1.16, teamId: 'ALL' },
            { id: 'WE1', title: 'Week end 1', hours: 28, factor: 1.32, teamId: 'ALL' },
            { id: 'WE2', title: 'Week end 2', hours: 28, factor: 1.32, teamId: 'ALL' },
            { id: 'WE24', title: 'Week end', hours: 24, factor: 1.55, teamId: 'ALL' },
            { id: 'DAG36', title: 'Dag hold', hours: 36, factor: 1.03, teamId: 'ALL' },
            { id: 'DAG37', title: 'Dag hold', hours: 37, factor: 1.00, teamId: 'ALL' }
        ],
        // Valg af skift afhænger af valgte hold (maskine).
        'Bogbind': [
            { id: 'DAG38', title: 'Dag hold', hours: 38, factor: 0.97, teamId: '2H' },
            { id: 'AFTEN34', title: 'Aften hold', hours: 34, factor: 1.09, teamId: '2H' },

            { id: 'DAG36', title: 'Dag hold', hours: 36, factor: 1.03, teamId: 'FT' }, // 20150224 cfi/columbus
            { id: 'DAG37', title: 'Dag hold', hours: 37, factor: 1.00, teamId: 'FT' },
            { id: 'WE24', title: 'Week end', hours: 24, factor: 1.55, teamId: 'FT' },
            { id: 'WE1-31', title: 'Week end 1', hours: 31, factor: 1.19, teamId: 'FT' },
            { id: 'WE2-31', title: 'Week end 2', hours: 31, factor: 1.19, teamId: 'FT' },

            // 20150312 cfi/columbus - trykkerassistenter slettet og 2-hold nat tilføjet
            { id: 'NAT34SPEC', title: 'Nat hold', hours: 34, factor: 1.09, teamId: '2HN' },
            { id: 'WE1-29', title: 'Week end 1', hours: 29, factor: 1.28, teamId: '2HN' },

            //{ id: 'DAG38', title: 'Dag hold', hours: 38, factor: 0.93, teamId: 'TA' },
            //{ id: 'AFTEN38', title: 'Aften hold', hours: 38, factor: 1.09, teamId: 'TA' },
            //{ id: 'NAT32', title: 'Nat hold', hours: 32, factor: 1.16, teamId: 'TA' },
            //{ id: 'WE1', title: 'Week end 1', hours: 28, factor: 1.28, teamId: 'TA' },
            //{ id: 'WE2', title: 'Week end 2', hours: 28, factor: 1.28, teamId: 'TA' },

            { id: 'DAG40', title: 'Dag hold', hours: 40, factor: 0.93, teamId: '3H' },
            { id: 'AFTEN34', title: 'Aften hold', hours: 34, factor: 1.09, teamId: '3H' },
            { id: 'NAT34', title: 'Nat hold', hours: 34, factor: 1.09, teamId: '3H' },
            { id: 'WE1-29', title: 'Week end', hours: 29, factor: 1.28, teamId: '3H' }, // 20150224 cfi/columbus

            { id: 'WE1-29', title: 'Week end 1', hours: 29, factor: 1.28, teamId: '4H' },
            { id: 'DAG40', title: 'Dag hold', hours: 40, factor: 0.93, teamId: '4H' },
            { id: 'DAG36', title: 'Dag hold', hours: 36, factor: 1.03, teamId: '4H' },
            { id: 'AFTEN34', title: 'Aften hold', hours: 34, factor: 1.09, teamId: '4H' },
            { id: 'WE2-29', title: 'Week end 2', hours: 29, factor: 1.28, teamId: '4H' },

            { id: 'DAG39', title: 'Dag hold', hours: 39, factor: 0.93, teamId: '3HP' },
            { id: 'AFTEN35', title: 'Aften hold', hours: 35, factor: 1.09, teamId: '3HP' },
            { id: 'NAT34', title: 'Nat hold', hours: 34, factor: 1.09, teamId: '3HP' }
        ]
    },
    getLocation: function ( location ) {
        if ( location.toLowerCase() === 'lager' )
            location = 'Rotation';

        return this.locations[location];
    },
    getShift: function ( location, id ) {
        if ( location.toLowerCase() === 'lager' )
            location = 'Rotation';

        return STIBO.utils.find(this.locations[location], 'id', id);
    }
};

STIBO.Timesheet.Configuration.lines = {
    // type                 Unikt ID for linjen.
    // lineView             Hvordan linien skal renderes (template).
    // sumGroup             Bruges ved summering og visning af sum.
    // description          Navn/beskrivelse af linjen
    // help                 Der vises en hjælpetekst på linjen
    // includeInGroupSum   Hvis 'false' så tælles timerne ikke med i sumGroup summen. !! Skal muligvis ændres som følge af markup sum grupperne??
    // sumNegative          Hvis 'true' så tæller timerne negativt i sumGroup summen.
    // saveToDatabase       Hvis 'false' så gemmes linien ikke i databasen.
    // foldGroup            Gruppering af linjer til hide/show
    locations: {
        'Rotation': [
            { type: 'A', lineView: 'hours', sumGroup: 'hours', description: 'Timer paa arbejdet inkl. overarbejde' },
            { type: 'B', lineView: 'hours', sumGroup: 'hours', description: 'Forlaegningstillaeg', includeInGroupSum: false },
            { type: 'C', lineView: 'hours', sumGroup: 'hours', description: 'Overarbejde 100%', sumNegative: true },
            { type: 'D', lineView: 'hours', sumGroup: 'hours', description: 'Hensat til afspadsering', includeInGroupSum: false },
            { type: 'E', lineView: 'hours', sumGroup: 'hours', description: 'Afspadserede timer' },
            { type: 'F', lineView: 'hours', sumGroup: 'hours', description: 'Afsp. Genetimer' },
            { type: 'G', lineView: 'hours', sumGroup: 'hours', description: 'Ferie' },
            { type: 'H', lineView: 'hours', sumGroup: 'hours', description: 'Feriefridage' },
            { type: 'I', lineView: 'hours', sumGroup: 'hours', description: 'Soen-/helligdage' },
            { type: 'J', lineView: 'hours', sumGroup: 'hours', description: 'Egen sygdom' },
            { type: 'K', lineView: 'hours', sumGroup: 'hours', description: 'Barn syg' },
            { type: 'SUM-HOURS', lineView: 'sum', sumGroup: 'hours', includeInGroupSum: false, saveToDatabase: false }
        ],
        'Bogbind': [
            { type: 'A', lineView: 'hours', sumGroup: 'hours', description: 'Timer på arbejdet inkl. overarbejde' },
            { type: 'B', lineView: 'hours', sumGroup: 'hours', description: 'Forlægning', includeInGroupSum: false },
            { type: 'C', lineView: 'hours', sumGroup: 'hours', description: 'Overarbejde 100%', sumNegative: true },
            { type: 'D', lineView: 'hours', sumGroup: 'hours', description: 'Hensat til afspadsering', includeInGroupSum: false },
            { type: 'E', lineView: 'hours', sumGroup: 'hours', description: 'Afspadserede timer' },
            { type: 'F', lineView: 'hours', sumGroup: 'hours', description: 'Afsp. Genetimer' },
            { type: 'J', lineView: 'hours', sumGroup: 'hours', description: 'Egen sygdom' },
            { type: 'K', lineView: 'hours', sumGroup: 'hours', description: 'Barn syg' },
            { type: 'G', lineView: 'hours', sumGroup: 'hours', description: 'Ferie - antal timer' },
            { type: 'H', lineView: 'hours', sumGroup: 'hours', description: 'Feriefri - antal timer' },
            { type: 'I', lineView: 'hours', sumGroup: 'hours', description: 'Soen-/helligdage - antal timer' },
            { type: 'L', lineView: 'hours', sumGroup: 'hours', description: 'Aflyst arbejde - firmabetalte timer tastes i "Timer på arbejde"' },
            { type: 'M', lineView: 'hours', sumGroup: 'hours', description: 'Betalt pause ved arbejde over 2 timer = 0,25 time per dag', includeInGroupSum: false },
            { type: 'SUM-HOURS', lineView: 'sum', sumGroup: 'hours', includeInGroupSum: false, saveToDatabase: false },

            { type: 'HEADER1', description: 'Maskinfører tillæg (skriv antal timer)', foldGroup: 'fgrp1', saveToDatabase: false },
            { type: 'FOLDGROUP-START', groupId: 'fgrp1', saveToDatabase: false },
            { type: 'X1', lineView: 'hours', sumGroup: 'supplement1', description: 'Binder' },
            { type: 'X2', lineView: 'hours', sumGroup: 'supplement1', description: 'Trekniv' },
            { type: 'X3', lineView: 'hours', sumGroup: 'supplement1', description: 'Optager' },
            { type: 'X4', lineView: 'hours', sumGroup: 'supplement1', description: 'Sitma' },
            { type: 'X10', lineView: 'hours', sumGroup: 'supplement1', description: 'Planskærer' }, // 20150224 cfi/columbus
            { type: 'X5', lineView: 'hours', sumGroup: 'supplement1', description: 'UV-lak' },
            { type: 'SUM-MARKUP1', lineView: 'sum', sumGroup: 'supplement1', includeInGroupSum: false, saveToDatabase: false },

            { type: 'X6', lineView: 'hours', sumGroup: 'supplement2', description: 'Tempo (1/2) klammehæft' },
            { type: 'X7', lineView: 'hours', sumGroup: 'supplement2', description: 'Prima Plus (1/2) klammehæft' },
            { type: 'X8', lineView: 'hours', sumGroup: 'supplement2', description: 'Prima 2 (1/2) klammehæft' },
            { type: 'X9', lineView: 'hours', sumGroup: 'supplement2', description: 'Falsemaskine (1/2)' },
            { type: 'SUM-MARKUP2', lineView: 'sum', sumGroup: 'supplement2', includeInGroupSum: false, saveToDatabase: false },
            { type: 'FOLDGROUP-END', groupId: 'fgrp1', saveToDatabase: false }
        ]
    },
    getLocation: function ( location ) {
        if ( location.toLowerCase() === 'lager' )
            location = 'Rotation';

        return this.locations[location];
    },
    getLine: function ( location, type ) {
        if ( location.toLowerCase() === 'lager' )
            location = 'Rotation';

        return STIBO.utils.find(this.locations[location], 'type', type);
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

