/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.timesheet.configuration.js" />
/// <reference path="stibo.timesheet.models.js" />

"use strict";


var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};


STIBO.Timesheet.timesheetFactory = function ( app, employeeId, timesheetId, weekNum, historyVersion ) {
    app.debug( "timesheetFactory(" + employeeId + ", " + timesheetId + ", " + weekNum + ", " + historyVersion + ")" );
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
        // Load specific version of existing timesheet.
        loadTimesheetVersion( employeeId, weekNum, historyVersion );
    }
    else {
        // Load existing active timesheet.
        loadTimesheet( timesheetId); //, historyVersion ); // change 20140106
    }

    function loadEmployee( employeeId ) {
        app.debug("timesheetFactory.loadEmployee("+ employeeId +")");
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
        app.debug( "timesheetFactory.loadTimesheet(" + timesheetId + ")" );
        $.when(
                dataService.getTimesheet( timesheetId )
            )
            .done(
                onTimesheetLoaded
            )
            .always();
    }


    function loadTimesheetVersion( employeeId, weekNum, role ) {
        app.debug( "timesheetFactory.loadTimesheetVersion("+employeeId+", "+ weekNum+ ","+role+")" );
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
        app.debug( 'timesheetFactory.onTimesheetLoaded(...)' );

        // Get line configuration for location that the employee belongs to.
        var configLines = STIBO.Timesheet.Configuration.lines.getLocation( employee.location );

        // Iterate over config lines and match them up with existing timesheet lines.
        // Also sort returned lines according to the configuration.
        var linesSorted = [];
        for ( var i = 0; i < configLines.length; i++ ) {
            var configLine = configLines[i];
            var currentLine = STIBO.utils.find( data.lines, 'type', configLines[i].type );
            if ( currentLine ) {
                // found a matching line
                currentLine.description = configLine.description;
                linesSorted.push( currentLine );
            }
            else {
                // timesheet line does not exist in configuration. What to do if this happens?
                //TODO: What if timesheet has lines with type not defined in line config??
                linesSorted.push( new STIBO.timesheet.models.TimesheetLine( configLine.type ) );
            }
        }

        // TODO:
        // !! What if the configuration line does not exist in the timesheet data?
        // This is relevant for SUM and TEXT lines!
        // Add these manually?

        // Replace returned lines with sorted lines.
        data.lines = linesSorted;

        timesheet = data;

    };


    // Create empty timesheet header and lines ready for editing.
    function createTimesheet( employee, weekNum ) {
        app.debug( "timesheetFactory.createTimesheet(" + employeeId + ", " + weekNum + ")" );
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