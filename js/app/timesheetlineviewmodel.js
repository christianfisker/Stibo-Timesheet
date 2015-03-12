/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};

//
// TimesheetLineViewModel
//
// Publishes:
//
// Subscribes:
//
//
STIBO.Timesheet.TimesheetLineViewModel = function ( app, parent, model ) {

    app.debug( 'new TimesheetLineViewModel()' );

    this.app = app;
    this.lineConfig = parent.getLineConfig( model.type );
    this.model = model;

    this.type = model.type;
    this.description = this.lineConfig.description;
    this.help = typeof this.lineConfig.help === 'string' ? this.lineConfig.help : null; // 20150312 cfi/columbus
    this.sunday = ko.observable( STIBO.utils.numberToHours( model.sunday ) );
    this.monday = ko.observable( STIBO.utils.numberToHours( model.monday ) );
    this.tuesday = ko.observable( STIBO.utils.numberToHours( model.tuesday ) );
    this.wednesday = ko.observable( STIBO.utils.numberToHours( model.wednesday ) );
    this.thursday = ko.observable( STIBO.utils.numberToHours( model.thursday ) );
    this.friday = ko.observable( STIBO.utils.numberToHours( model.friday ) );
    this.saturday = ko.observable( STIBO.utils.numberToHours( model.saturday ) );

    // Total hours for this timesheet line.
    this.totalForLine = ko.pureComputed( this._totalForLine, this );

    // Total hours for this timesheet line. Returns 0 if the total is not to be counted towards timesheet total.
    //this.totalForTimesheet = ko.pureComputed( this._totalForTimesheet, this );
};

STIBO.Timesheet.TimesheetLineViewModel.prototype._totalForLine = function () {

    this.app.debug( 'timesheetLineViewModel.totalForLine()' );

    var total = 0;

    try {
        total =
            parseFloat( '0' + this.sunday() ) +
            parseFloat( '0' + this.monday() ) +
            parseFloat( '0' + this.tuesday() ) +
            parseFloat( '0' + this.wednesday() ) +
            parseFloat( '0' + this.thursday() ) +
            parseFloat( '0' + this.friday() ) +
            parseFloat( '0' + this.saturday() );
    }
    catch ( ex ) {
        this.app.debug( 'Tried to parse invalid value...' );
        total = 0;
    }

    return STIBO.utils.numberToHours( total );
};

STIBO.Timesheet.TimesheetLineViewModel.prototype.totalForTimesheet = function ( sumGroup ) {

    this.app.debug( 'timesheetLineViewModel.totalForTimesheet()' );

    var total = 0;

    // Is !ignoreInTotal then get value from totalForLine
    if ( this.lineConfig.sumGroup === sumGroup && this.lineConfig.includeInGroupSum !== false ) {
        total = this.totalForLine();
        total = STIBO.utils.hoursToNumber( total );

        // If sumNegative, then subtract hours from total (overtime).
        if ( this.lineConfig.sumNegative === true ) {
            total = -total;
        }
    }

    return total;
};

STIBO.Timesheet.TimesheetLineViewModel.prototype.isDirty = function () {

    this.app.debug( 'timesheetLineViewModel.isDirty()' );

    var flag = false;

    flag =
        this.sunday() != this.model.sunday ||
        this.monday() != this.model.monday ||
        this.tuesday() != this.model.tuesday ||
        this.wednesday() != this.model.wednesday ||
        this.thursday() != this.model.thursday ||
        this.friday() != this.model.friday ||
        this.saturday() != this.model.saturday;

    return flag;
};

//
// Called by timesheetViewModel.getData()
STIBO.Timesheet.TimesheetLineViewModel.prototype.getData = function () {

    this.app.debug( 'timesheetLineViewModel.getData()' );

    if ( this.lineConfig.saveToDatabase === false ) {
        return null;
    }

    if ( this.isDirty() ) {
        this.model.sunday = parseFloat( this.sunday() );
        this.model.monday = parseFloat( this.monday() );
        this.model.tuesday = parseFloat( this.tuesday() );
        this.model.wednesday = parseFloat( this.wednesday() );
        this.model.thursday = parseFloat( this.thursday() );
        this.model.friday = parseFloat( this.friday() );
        this.model.saturday = parseFloat( this.saturday() );
    }

    return this.model;
};

STIBO.Timesheet.TimesheetLineViewModel.prototype.getLineType = function () {
    return this.lineConfig.lineType;
}

STIBO.Timesheet.TimesheetLineViewModel.prototype.getLineView = function () {
    return this.lineConfig.lineView;
}

STIBO.Timesheet.TimesheetLineViewModel.prototype.getSumGroup = function () {
    return this.lineConfig.sumGroup;
}

