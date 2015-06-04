'use strict';

STIBO.Timesheet = STIBO.Timesheet || {};
STIBO.Timesheet.Configuration = STIBO.Timesheet.Configuration || {};

//STIBO.Timesheet.Settings = {

//    companyCode: 'CPV',             // 20150211 cfi/columbus - Separation between SGT and CPV
//    hoursOnTimesheet: 74,           // 20150211 cfi/columbus - CPV timesheets start with 74 hours and subtract entered hours!

//    debugActive: true,              // REMEMBER - Set to false when LIVE
//    autoSelectCurrentWeek: false,   // not in use
//    dummy: null
//};

STIBO.Timesheet.Configuration.debugActive = false; // REMEMBER - Set to false when LIVE

STIBO.Timesheet.Configuration.companyCode = 'CPV';
STIBO.Timesheet.Configuration.initialHoursOnTimesheet = 37; // CPV tæller nedaf for en hel uge

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
            { id: 'M600b', name: 'M600b', teamId: 'ALL' },
            { id: 'k-750', name: 'k-750', teamId: 'ALL' },
            { id: 'I-32', name: 'I-32', teamId: 'ALL' },
            { id: 'I-48', name: 'I-48', teamId: 'ALL' },
            { id: 'I80', name: 'I80', teamId: 'ALL' }
            // 20150312 cfi/columbus - Denne kommer muligvis på en anden lokation senere.
            //,{ id: 'M64', name: 'M64', teamId: 'ALL' }
        ]
    },
    getLocation: function (location) {
        return this.locations[location];
    },
    getMachine: function (location, id) {
        return STIBO.utils.find(this.locations[location], 'id', id);
    }
};

STIBO.Timesheet.Configuration.shifts = {
    locations: {
        'Rotation': [
            { id: 'DAG41', title: 'Dag 41', hours: '', factor: 0, teamId: 'ALL' },
            { id: 'DAG32', title: 'Dag 32 + weekend', hours: '', factor: 0, teamId: 'ALL' },
            { id: 'DAG37', title: 'Dag 37', hours: '', factor: 0, teamId: 'ALL' },
            { id: 'AFTEN', title: 'Aften', hours: '', factor: 0, teamId: 'ALL' },
            { id: 'NAT23', title: 'Nat 23', hours: '', factor: 0, teamId: 'ALL' },
            { id: 'NAT14', title: 'Nat 14', hours: '', factor: 0, teamId: 'ALL' },
            { id: 'NAT28', title: 'Nat 28', hours: '', factor: 0, teamId: 'ALL' }//,
            //{ id: 'WE1', title: 'Week end 1', hours: '', factor: 0, teamId: 'ALL' },
            //{ id: 'WE2', title: 'Week end 2', hours: '', factor: 0, teamId: 'ALL' }
        ]
    },
    getLocation: function (location) {
        return this.locations[location];
    },
    getShift: function (location, id) {
        return STIBO.utils.find(this.locations[location], 'id', id);
    }
};

STIBO.Timesheet.Configuration.lines = {
    // type                 Unikt ID for linjen.
    // lineView             Hvordan linien skal renderes (template).
    // sumGroup             Bruges ved summering og visning af sum.
    // description          Navn/beskrivelse af linjen
    // help                 Der vises en hjælpetekst på linjen
    // includeInGroupSum    Hvis 'false' så tælles timerne ikke med i sumGroup summen. !! Skal muligvis ændres som følge af markup sum grupperne??
    // sumNegative          Hvis 'true' så tæller timerne negativt i sumGroup summen.
    // saveToDatabase       Hvis 'false' så gemmes linien ikke i databasen.
    locations: {
        'Rotation': [
            { type: 'A', lineView: 'hours', sumGroup: 'hours', description: 'Afspadsering tvungen', sumNegative: true },
            { type: 'B', lineView: 'hours', sumGroup: 'hours', description: 'Afspadsering egne timer', sumNegative: true },
            { type: 'C', lineView: 'hours', sumGroup: 'hours', description: 'Afspadsering tillæg', sumNegative: true },
            { type: 'D', lineView: 'hours', sumGroup: 'hours', description: 'Ferie', help: 'Hel uge tastes i søndag', sumNegative: true },
            { type: 'E', lineView: 'hours', sumGroup: 'hours', description: 'Feriefritimer', sumNegative: true },
            //{ type: 'F', lineView: 'hours', sumGroup: 'hours', description: 'Soen-/helligdage', sumNegative: true },
            { type: 'G', lineView: 'hours', sumGroup: 'hours', description: 'Egen sygdom', sumNegative: true },
            { type: 'H', lineView: 'hours', sumGroup: 'hours', description: 'Barn syg', sumNegative: true },
            { type: 'SUM-HOURS', lineView: 'sum', sumGroup: 'hours', includeInGroupSum: false, saveToDatabase: false },

            { type: 'X1', lineView: 'hours', sumGroup: 'supplement1', description: '122% tvungen' },
            { type: 'X6', lineView: 'hours', sumGroup: 'supplement1', description: '122% egne timer' },
            { type: 'X2', lineView: 'hours', sumGroup: 'supplement1', description: '150% tvungen' },
            { type: 'X7', lineView: 'hours', sumGroup: 'supplement1', description: '150% egne timer' },
            { type: 'X3', lineView: 'hours', sumGroup: 'supplement1', description: 'Førertrykkertillæg' },
            { type: 'X4', lineView: 'hours', sumGroup: 'supplement1', description: 'Udbetalt afspadsering egne timer', help: 'Tast total i søndag' },
            { type: 'X8', lineView: 'hours', sumGroup: 'supplement1', description: 'Udbetalt afspadsering tillæg', help: 'Tast total i søndag' },
            { type: 'X5', lineView: 'hours', sumGroup: 'supplement1', description: 'Faktiske timer på arbejde' },
            { type: 'SUM-MARKUP1', lineView: 'sum', sumGroup: 'supplement1', includeInGroupSum: false, saveToDatabase: false }
        ]
    },
    getLocation: function (location) {
        return this.locations[location];
    },
    getLine: function (location, type) {
        return STIBO.utils.find(this.locations[location], 'type', type);
    }
};
