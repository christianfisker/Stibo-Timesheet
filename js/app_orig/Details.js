/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.dataService.js" />
/// <reference path="User.js" />
/// <reference path="Overview.js" />
/// <reference path="Settings.js" />
/// <reference path="TimesheetHeader.js" />
/// <reference path="TimesheetLine.js" />

// Examples of data passed to viewModel.
//var employee = {
//    id: 1000,
//    name: 'Name of employee'
//};

//var week = {
//    id: 'GUID',
//    week: '201410',
//    status: 'BLANK'
//};

"use strict";

var STIBO = window.STIBO || {};
STIBO.viewModels = STIBO.viewModels || {};


//
// TimesheetDetailViewModel
//
// Publishes:
//      detailsUpdated()* - not implemented
//      details.closed() - detail view has been exited (parameter for change/nochange??)
//
// Subscribes:
//      overview.timesheetSelected(employee, week)
//
STIBO.viewModels.TimesheetDetailViewModel = function ( _user, configuration ) {
    var self = this,
        priv = {};

    // context data
    self.header = null;
    self.lines = [];

    // parent data
    self.user = _user;
    self.employee = null;
    self.week = null;

    // support data
    self.machines = null;
    self.shifts = null;

    //self.styleColumnSumField = function ( columnName ) {
    //    var sum, norm;

    //    try {
    //        sum = parseFloat( self.sumColumn( columnName ) ); // TODO: Skal ikke være nødvendigt at foretage en parse her!
    //        norm = findShift( self.header.shift ).hours;
    //    }
    //    catch ( ex ) {
    //        console.dir( ex );
    //        return '';
    //    }

    //    if ( sum === norm )
    //        return 'green';

    //    return sum < norm ? 'red' : 'yellow';
    //};

    ko.defineProperty( this, 'isVisible', function () {
        console.log( "Details.isVisible" );
        return _user.isLoggedIn && self.header != null; // this.isVisible;
        //return this.user.isLoggedIn && this.isVisible;
    } );

    ko.defineProperty( this, 'isDirty', function () {
        return false;
    } );

    // Save timesheet.
    self.onBtnSave = function () {
        hideModal();

        alert( isDirty() );
        //return;

        // 1. local validation
        if ( self.validate() ) {

            if ( self.user.role === 1 ) {
                self.header.state = 'OPEN';
            }

            //if ( user.role === 2 ) {
            //    self.header.state = 
            //}

            if ( self.user.role === 3 ) {
                if ( self.header.state === 'APPROVED' || self.header.state === 'APPROVEDTENTATIVE' ) {
                    // recalculate and update state
                    self.header.state = self.header.sumIsOk() ? 'APPROVED' : 'APPROVEDTENTATIVE';
                }
            }

            // 2. submit data
            save();

            // 3. close
            reset();

            // 4. publish event...
            //
            $.Topic( 'details.closed' ).publish();
        }

        //save();
    };

    // Save and submit/approve/close timesheet.
    self.onBtnSubmit = function () {
        hideModal();

        if ( self.user.role === 1 ) {
            self.header.state = 'SUBMITTED';
        }

        if ( self.user.role === 2 ) {
            self.header.state = self.header.sumIsOk() ? 'APPROVED' : 'APPROVEDTENTATIVE';
        }

        if ( self.user.role === 3 ) {
            self.header.state = 'CLOSED';
        }

        save();
        reset();
        $.Topic( 'details.closed' ).publish();
    };

    // Cancel changes to timesheet.
    self.onBtnCancel = function () {

        //$.when( hideModal() )
        //    .done( function () {
        //        reset();
        //        $.Topic( 'details.closed' ).publish();
        //    } );

        hideModal();

        // gem ikke ændringer og gå tilbage til oversigten
        reset();
        $.Topic( 'details.closed' ).publish();
    };


    self.showModal = function () {
        showModal();
    };


    self.validate = function () {
        var ok = true,
            errorList = [];


        // 1. Er der valgt en maskine (machine)?
        // 2. Er der valgt et skift (shift)?

        ok = self.header.validate( errorList ) && ok;


        if ( !ok && errorList.length > 0 ) {
            var message = '';
            for ( var i = 0; i < errorList.length; i++ ) {
                message += errorList[i];
            }

            alert( message );
        }

        return ok;
    };

    // True if no timesheet is loaded.
    self.isEmpty = function () {
        return ( self.header == null );
    };

    ko.track( self );

    //
    // Private functions

    // True if any value in the header or lines is different from the original.
    function isDirty() {
        if ( self.isEmpty() )
            return false;

        return (
            self.header.isDirty() ||
            _.some( self.lines, function ( line ) { return line.isDirty(); } )
        );
    }

    // save the current timesheet details to the server.
    function save() {

        var timesheet = self.header;
        timesheet.lines = self.lines;

        console.dir( timesheet );

        STIBO.dataService.saveTimesheet( timesheet );
    }


    function reset() {
        self.isCompleted = false;
        self.header = null;
        self.lines = [];
    }

    function showModal() {
        $( '#modalTest' ).modal( { backdrop: 'static' } );
    }

    function hideModal() {

        //if modal is open then close it using a promise that gets completed after bs hide event!!

        //$( '#modalTest' ).on( 'hidden.bs.modal', function ( e ) {
        //    //complete the promise!!
        //} )

        $( '#modalTest' ).modal( 'hide' );
    }

    // Get timesheet from server or create new blank timesheet.
    function onTimesheetSelected( employee, week ) {

        console.log( 'detail.onTimesheetSelected' );

        function prepareTimesheet( employee, week ) {
            reset();

            self.week = week;

            loadEmployee( employee.id ); // load complete employee data

            if ( week.id === null ) {
                // Blank timesheet so we must create it from scratch.
                createTimesheet( employee, week ); // TODO: not completed... wrong employee object...
            }
            else {
                loadTimesheet( week.id );
            }
        }

        //if ( self.isReady() && isDirty() ) {
        //    alert('Timesheet has been altered but not saved!');
        //    // The current timesheet has been altered but not saved.
        //    // Show modal savewarning dialog.
        //    // if save/submit/cancel then 
        //    // if close modal then 
        //}

        console.log( ' - isEmpty = ' + self.isEmpty() );
        console.log( ' - isDirty = ' + isDirty() );

        if ( self.isEmpty() || !isDirty() ) {

            prepareTimesheet( employee, week );
            //reset();

            //self.week = week;

            //loadEmployee( employee.id ); // load complete employee data

            //if ( week.id === null ) {
            //    // Blank timesheet so we must create it from scratch.
            //    createTimesheet( employee, week ); // TODO: not completed... wrong employee object...
            //}
            //else {
            //    loadTimesheet( week.id );
            //}
        }
        else {
            // Ignore.... 
        }
    }

    function loadEmployee( employeeId, week ) {
        $.when(
                STIBO.dataService.getEmployee( employeeId )
            )
            .done(
                onEmployeeLoaded
            )
            .always();
    }

    function onEmployeeLoaded( data ) {
        console.dir( data );
        self.employee = data;
        self.machines = STIBO.Timesheet.Configuration.machines.getLocation( self.employee.location );
        self.shifts = STIBO.Timesheet.Configuration.shifts.getLocation( self.employee.location );
    }

    function loadTimesheet( timesheetId ) {
        $.when(
                STIBO.dataService.getTimesheet( timesheetId )
            )
            .done(
                onTimesheetLoaded
            )
            .always();
    }

    function onTimesheetLoaded( data ) {
        var newLines = [];

        console.dir( data );

        //TODO: Is the returned data valid?

        self.header = new STIBO.viewModels.TimesheetHeader( self, data );

        // Get line configuration for location that the employee belongs to.
        var configLines = STIBO.Timesheet.Configuration.lines.getLocation( self.employee.location );

        // Iterate over config lines and match them up with existing timesheet lines.
        for ( var i = 0; i < configLines.length; i++ ) {
            var configLine = configLines[i];
            var currentLine = STIBO.utils.find( data.lines, 'type', configLines[i].type );
            if ( currentLine ) {
                // found a matching line
                currentLine.description = configLine.description;

                newLines.push( new STIBO.viewModels.TimesheetLine( self, currentLine ) );
                //self.lines.push( new STIBO.viewModels.TimesheetLine( self, currentLine ) );
            }
            else {
                // line is missing

                newLines.push( new STIBO.viewModels.TimesheetLine( self, { type: configLine.type, description: configLine.description } ) );
                //self.lines.push( new STIBO.viewModels.TimesheetLine( self, { type: configLine.type, description: configLine.description } ) );
            }

            //TODO: What if timesheet has lines with type not defined in line config??
        }

        self.lines = newLines;

        //for ( var i = 0; i < data.lines.length; i++ ) {
        //    // TODO: ?Skal der itereres over config lines og så finde ugeseddel linie ud fra dette. Opret tom hvis den mangler. Sortering efter config.

        //    // Find the line config that matches the type of the current timesheet line.
        //    var configLine = STIBO.utils.find( configLines, 'type', data.lines[i].type );
        //    data.lines[i].description = configLine.description;

        //    self.lines.push( new STIBO.viewModels.TimesheetLine( self, data.lines[i] ) );
        //}

    };

    // Create empty timesheet header and lines ready for editing.
    function createTimesheet( employee, week ) {
        var newLines = [];

        self.header = new STIBO.viewModels.TimesheetHeader( self, { employeeId: employee.id, location: employee.location, week: week.week } );

        // Get line configuration for location that the employee belongs to.
        var configLines = STIBO.Timesheet.Configuration.lines.getLocation( self.employee.location );
        for ( var i = 0; i < configLines.length; i++ ) {
            var configLine = configLines[i];

            newLines.push( new STIBO.viewModels.TimesheetLine( self, { type: configLine.type, description: configLine.description } ) );
            //self.lines.push( new STIBO.viewModels.TimesheetLine( self, { type: configLine.type, description: configLine.description } ) );
        }

        self.lines = newLines;
    }

    function findShift( id ) {

        return STIBO.utils.find( self.shifts, 'id', id );

        //return _.find( self.shifts, function ( shift ) { return shift.id === id; } );
    }

    function findLineConfig( id ) {
        return STIBO.utils.find()
    }

    $.Topic( 'overview.timesheetSelected' ).subscribe( onTimesheetSelected );
}

//
// Utilities
//

//STIBO.utils = STIBO.utils || {};

//// Find an object in an array by comparing a specified field with a value.
//STIBO.utils.find = function ( arCollection, sField, aValue ) {
//    return _.find(
//        arCollection,
//        function ( element ) {
//            return element[sField] === aValue;
//        }
//    );
//}

//// Return null (or defaultvalue) if the value is undefined. Else returns the value.
//STIBO.utils.default = function ( value, defaultValue ) {
//    return _.isUndefined( value ) ?
//        ( _.isUndefined( defaultValue ) ? null : defaultValue ) :
//        value;
//};

//// Takes output from a parseFloat() function  and checks/converts...
//STIBO.utils.toNumber = function ( value, decimals, round ) {

//    if ( _.isNaN || !_.isNumber( value ) )
//        return 0.00;

//    return value.toFixed( 2 );
//};
