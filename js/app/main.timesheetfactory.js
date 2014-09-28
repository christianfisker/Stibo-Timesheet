/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.timesheet.configuration.js" />
/// <reference path="stibo.timesheet.models.js" />

"use strict";


var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};


STIBO.Timesheet.timesheetFactory = function ( employeeId, timesheetId, weekNum, historyVersion ) {

    var dataService = STIBO.dataService;

    // 1. get employee from server
    // 2. prepare timesheet
    //  a. Load from server if timesheetId != null
    //  b. Create new empty timesheet based on employee
    var employee = null;
    var timesheet = null;

    loadEmployee( employeeId ); // syncronous call

    if ( timesheetId === null ) {
        // Blank timesheet so we must create it from scratch.
        createTimesheet( employee, weekNum ); // TODO: not completed... wrong employee object...
    }
    else if ( historyVersion !== undefined ) {
        loadTimesheetVersion( employeeId, weekNum, historyVersion );
    }
    else {
        loadTimesheet( timesheetId, historyVersion );
    }

    function loadEmployee( employeeId ) {
        $.when(
                dataService.getEmployee( employeeId )
            )
            .done(
                function ( data ) { employee = data; }
            )
            .always();
    }

    //function onEmployeeLoaded( data ) {
    //    employee = data;
    //    //self.machines = STIBO.Timesheet.Configuration.machines.getLocation( self.employee.location );
    //    //self.shifts = STIBO.Timesheet.Configuration.shifts.getLocation( self.employee.location );
    //}

    function loadTimesheet( timesheetId ) {
        $.when(
                dataService.getTimesheet( timesheetId )
            )
            .done(
                onTimesheetLoaded
            )
            .always();
    }

    function loadTimesheetVersion( employeeId, weekNum, role ) {
        $.when(
                dataService.getTimesheetVersion( employeeId, weekNum, role )
            )
            .then(
                onTimesheetLoaded
            )
            .fail( function ( jqXhr ) {
                //TODO: show pretty error message...
                alert( jqXhr.responseJSON.errorMessage );
                //$.Topic( 'notification.timesheet.clear' ).publish();
            } )
            .always();
    }

    function onTimesheetLoaded( data ) {
        //app.debug( 'TimesheetFactory.onTimesheetLoaded()' );
        //var newLines = [];

        //app.debug( data );

        //TODO: Is the returned data valid?

        //self.header = new STIBO.viewModels.TimesheetHeader( self, data );

        // Get line configuration for location that the employee belongs to.
        var configLines = STIBO.Timesheet.Configuration.lines.getLocation( employee.location );

        // Iterate over config lines and match them up with existing timesheet lines.
        for ( var i = 0; i < configLines.length; i++ ) {
            var configLine = configLines[i];
            var currentLine = STIBO.utils.find( data.lines, 'type', configLines[i].type );
            if ( currentLine ) {
                // found a matching line
                currentLine.description = configLine.description;

                //newLines.push( new STIBO.viewModels.TimesheetLine( self, currentLine ) );
            }
            else {
                // line is missing

                //newLines.push( new STIBO.viewModels.TimesheetLine( self, { type: configLine.type, description: configLine.description } ) );
            }

            //TODO: What if timesheet has lines with type not defined in line config??
        }

        timesheet = data;

        //self.lines = newLines;

        //for ( var i = 0; i < data.lines.length; i++ ) {
        //    // TODO: ?Skal der itereres over config lines og så finde ugeseddel linie ud fra dette. Opret tom hvis den mangler. Sortering efter config.

        //    // Find the line config that matches the type of the current timesheet line.
        //    var configLine = STIBO.utils.find( configLines, 'type', data.lines[i].type );
        //    data.lines[i].description = configLine.description;

        //    self.lines.push( new STIBO.viewModels.TimesheetLine( self, data.lines[i] ) );
        //}

    };

    // Create empty timesheet header and lines ready for editing.
    function createTimesheet( employee, weekNum ) {

        var lines = [];

        timesheet = new STIBO.timesheet.models.Timesheet( employee.id, employee.location, weekNum );

        // Get line configuration for location that the employee belongs to.
        var configLines = STIBO.Timesheet.Configuration.lines.getLocation( employee.location );
        for ( var i = 0; i < configLines.length; i++ ) {
            var configLine = configLines[i];

            lines.push( new STIBO.timesheet.models.TimesheetLine( configLine.type ) );
        }

        timesheet.lines = lines;
    }

    return {
        employee: employee,
        timesheet: timesheet
    };
};