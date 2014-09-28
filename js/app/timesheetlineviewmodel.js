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
    app.debug( 'TimesheetLineViewModel()' );

    var self = this;

    self.type = model.type;
    self.description = parent.getLineConfig( model.type ).description;
    self.sunday = ko.observable( STIBO.utils.numberToHours( model.sunday ) );
    self.monday = ko.observable( STIBO.utils.numberToHours( model.monday ) );
    self.tuesday = ko.observable( STIBO.utils.numberToHours( model.tuesday ) );
    self.wednesday = ko.observable( STIBO.utils.numberToHours( model.wednesday ) );
    self.thursday = ko.observable( STIBO.utils.numberToHours( model.thursday ) );
    self.friday = ko.observable( STIBO.utils.numberToHours( model.friday ) );
    self.saturday = ko.observable( STIBO.utils.numberToHours( model.saturday ) );

    // Total hours for this timesheet line. (some lines are not counted towards timesheet total)
    self.totalForLine = ko.pureComputed( function () {
        app.debug( 'TimesheetLineViewModel.totalForLine()' );

        var total = 0;

        try {
            total =
                parseFloat( '0' + self.sunday() ) +
                parseFloat( '0' + self.monday() ) +
                parseFloat( '0' + self.tuesday() ) +
                parseFloat( '0' + self.wednesday() ) +
                parseFloat( '0' + self.thursday() ) +
                parseFloat( '0' + self.friday() ) +
                parseFloat( '0' + self.saturday() );
        }
        catch ( ex ) {
            app.debug( 'Tried to parse invalid value...' );
            total = 0;
        }

        return STIBO.utils.numberToHours( total );
    } );

    self.totalForTimesheet = ko.pureComputed( function () {
        app.debug( 'TimesheetLineViewModel.totalForTimesheet()' );

        var total = 0,
            lineTotal = 0,
            lineConfig = parent.getLineConfig( self.type );


        // Is !ignoreInTotal then get value from totalForLine
        if ( lineConfig.includeInColumnSum !== false ) {
            total = self.totalForLine();
            total = STIBO.utils.hoursToNumber( total );

            // If sumNegative, then subtract hours from total (overtime).
            if ( lineConfig.sumNegative === true ) {
                total = -total;
            }
        }

        return total;
    } );

    self.isDirty = function () {
        app.debug( 'TimesheetLineViewModel.isDirty()' );

        var flag = false;
        flag = 
            self.sunday() != model.sunday ||
            self.monday() != model.monday ||
            self.tuesday() != model.tuesday ||
            self.wednesday() != model.wednesday ||
            self.thursday() != model.thursday ||
            self.friday() != model.friday ||
            self.saturday() != model.saturday;

        return flag;
    };

    self.getData = function () {
        if ( self.isDirty() ) {
            model.sunday = parseFloat(self.sunday());
            model.monday = parseFloat(self.monday());
            model.tuesday = parseFloat(self.tuesday());
            model.wednesday = parseFloat(self.wednesday());
            model.thursday = parseFloat(self.thursday());
            model.friday = parseFloat(self.friday());
            model.saturday = parseFloat(self.saturday());
        }

        return model;
    };
};
