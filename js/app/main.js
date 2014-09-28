/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.timesheet.configuration.js" />
/// <reference path="stibo.timesheet.models.js" />

"use strict";


var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};

//
// Dispatcher
//  Capture events that are published by other components.
//  Perform actions based on the captured events.
//  Publish events based on the performed actions.
//
// Publishes:
//      notification.user.loggedin
//      notification.user.canlogout
//      notification.user.loggedout
//      notification.timesheetoverview.canselect
//      notification.timesheetoverview.loaded
//      notification.timesheet.loaded
//      notification.timesheet.clear
//
// Subscribes:
//      shortcut.logout                 - User pressed Ctrl + Q to log out.
//      loginviewmodel.onlogin
//      userviewmodel.onlogout
//      timesheetoverview.onselected
//      timesheet.save                  - Triggered by TimesheetViewModel when the user wants to save a timesheet.
//      timesheet.clear
//      timesheet.history.getversion
//
STIBO.Timesheet.Dispatcher = function ( application ) {

    var app = application,
        dataService = STIBO.dataService;

    $.Topic( 'shortcut.logout' ).subscribe( logout );
    
    $.Topic( 'loginviewmodel.onlogin' ).subscribe( login );
    $.Topic( 'userviewmodel.onlogout' ).subscribe( logout );

    //$.Topic( 'timesheetoverview.canselect' ).subscribe(); // not implemented - this is not relevant, the event is triggered as a notification!!
    $.Topic( 'timesheetoverview.onselected' ).subscribe( onTimesheetSelected );

    $.Topic( 'timesheet.save' ).subscribe( onTimesheetSave );
    //$.Topic( 'timesheet.saved' ).subscribe(); // not implemented

    // TESTING
    $.Topic( 'timesheet.clear' ).subscribe( function () {
        //
        app.currentEmployee = null;
        $.Topic( 'notification.timesheet.clear' ).publish();
    } );

    $.Topic( 'timesheet.history.getversion' ).subscribe( function ( timesheetId, weekNum, version ) {
        // build data object
        var week = {
            employee: app.currentEmployee,
            id: timesheetId,
            week: weekNum,
            historyVersion: version // 1 = employee, 2 = approver, 3 = payroll
        };

        getTimesheet( week );

    } );

    function login( credentials ) {

        //TODO: show progress...

        $.when( dataService.login( credentials.username, credentials.password ) )
            .then( function () {
                return dataService.getCurrentUser();
            })
            .then( function ( user ) {
                $.Topic( 'notification.user.loggedin' ).publish( user );
                return dataService.getTimesheetOverview()
            } )
            .then( function ( data ) {
                // update data so that individual week objects have a reference to the employee object (week.employee = employee)
                for ( var i = 0; i < data.employees.length; i++ ) {
                    for ( var j = 0; j < data.employees[i].weeks.length; j++ ) {
                        data.employees[i].weeks[j].employee = data.employees[i].employee;
                    }
                }

                $.Topic( 'notification.timesheetoverview.loaded' ).publish( data );
            } )
            .fail( function ( jqXhr ) {
                //TODO: show pretty error message...
                alert( jqXhr.responseJSON.errorMessage );
                $.Topic( 'notification.login.reset' ).publish();
                //TODO: logout?
            } )
            .always( function () {
                //TODO: hide progress
            } );

        return;

        //$.when(
        //        dataService.login( credentials.username, credentials.password )
        //    )
        //    .done(
        //        // login successful, now get the current user.
        //        getCurrentUser
        //    )
        //    .fail(
        //        // login failed
        //        function ( jqXml ) {
        //            $.Topic( 'notification.error.userlogin' ).publish( jqXml.responseJSON );
        //        }
        //    )
        //    .always();
    }

    function logout() {
        app.debug( 'Dispatcher.logout()' );

        var deferred = $.Deferred(),
            promise = deferred.promise();

        // send out notification to check wether logout is allowed (no, if a timesheet is dirty).
        //$.Topic( 'notification.user.canlogout' ).publish( deferred );

        //$.when( promise )
        //    .done( function () { app.debug( 'logout - okay' ); } )
        //    .fail( function () { app.debug( 'logout - noway!' ); } )
        //    .always( function () { app.debug( 'logout - always' ); } );

        function checkCanLogout() {
            var deferred = $.Deferred();
            $.Topic( 'notification.user.canlogout' ).publish( deferred );
            return deferred;
        }

        $.when( checkCanLogout() )
            .then( dataService.logout )
            .done( function () {
                $.Topic( 'notification.user.loggedout' ).publish();
            } );
            
        return;


        //// Hopper direkte til .fail() med parameteren 'failed!'
        //$.when( $.Deferred().resolve( 2 ),
        //        $.Deferred().reject( 'failed!' ) )
        //    .then( function () {
        //        return $.Deferred().reject( 4 );
        //    } )
        //    .then( function () {
        //        return $.Deferred().resolve( "hejsa" );
        //    } )
        //    .fail( function () {
        //        alert( 'failed?' );
        //    } )
        //    .always( function () {
        //        alert( 'always' );
        //    } );

        //// Fortsætter til første .then(2, 'fine'). Fejler og går til .fail(4) udenom næste .then()
        //$.when( $.Deferred().resolve( 2 ),
        //        $.Deferred().resolve( 'fine' ) )
        //    .then( function () {
        //        return $.Deferred().reject( 4 );
        //    } )
        //    .then( function () {
        //        return $.Deferred().resolve( "hejsa" );
        //    } )
        //    .fail( function () {
        //        alert( 'failed?' );
        //    } )
        //    .always( function () {
        //        alert( 'always' );
        //    } );

        //return;


        //$.when(
        //        dataService.logout()
        //    )
        //    .done(
        //        function () { $.Topic( 'notification.user.loggedout' ).publish(); }
        //    )
        //    .fail(
        //        function ( jqXml ) { $.Topic( 'notification.error.userlogout' ).publish( jqXml.responseJSON ); }
        //    )
        //    .always();
        
    }

    //function getCurrentUser() {
    //    $.when( dataService.getCurrentUser() )
    //        .done( function ( user ) {
    //            $.Topic( 'notification.user.loggedin' ).publish( user );
    //            getTimesheetOverview();
    //        } );
    //}

    //function getTimesheetOverview() {
    //    $.when( dataService.getTimesheetOverview() )
    //        .done( function ( data ) {

    //            // update data so that individual week objects have a reference to the employee object (week.employee = employee)
    //            for ( var i = 0; i < data.employees.length; i++ ) {
    //                for ( var j = 0; j < data.employees[i].weeks.length; j++ ) {
    //                    data.employees[i].weeks[j].employee = data.employees[i].employee;
    //                }
    //            }

    //            $.Topic( 'notification.timesheetoverview.loaded' ).publish( data );
    //        } );
    //}

    function onTimesheetSelected( week ) {
        app.debug( 'Dispatcher.onTimesheetSelected()' );

        function canSelectTimesheet() {
            var deferred = $.Deferred();
            $.Topic( 'notification.timesheetoverview.canselect' ).publish( deferred );
            return deferred;
        }

        function getSelectedTimesheet() {
            app.currentEmployee = week.employee;
            getTimesheet( week );
        }

        $.when( canSelectTimesheet() )
            .then( getSelectedTimesheet );

        //app.currentEmployee = week.employee;
        //getTimesheet( week );
    }

    // Load timesheet from server and dispatch...
    function getTimesheet( week ) {
        
        var timesheet = STIBO.Timesheet.timesheetFactory( week.employee.id, week.id, week.week, week.historyVersion );

        if ( timesheet.timesheet !== null && timesheet.employee !== null ) {
            app.debug( 'publish - notification.timesheet.loaded' );
            $.Topic( 'notification.timesheet.loaded' ).publish( timesheet.employee, timesheet.timesheet );
        }

        // load complete employee
        //loadEmployee( employee.id ); // load complete employee data

        //if ( week.id === null ) {
        //    // Blank timesheet so we must create it from scratch.
        //    createTimesheet( employee, week ); // TODO: not completed... wrong employee object...
        //}
        //else {
        //    loadTimesheet( week.id );
        //}

    }

    $.Topic( 'notification.timesheet.loaded' ).subscribe(
        function ( timesheet ) {
            app.debug( timesheet );
    } ); // TESTING

    function loadEmployee( employeeId ) {
        $.when(
                dataService.getEmployee( employeeId )
            )
            .done(
                onEmployeeLoaded
            )
            .always();
    }

    function onEmployeeLoaded( data ) {
        app.debug( data );

        self.employee = data;
        self.machines = STIBO.Timesheet.Configuration.machines.getLocation( self.employee.location );
        self.shifts = STIBO.Timesheet.Configuration.shifts.getLocation( self.employee.location );
    }

    // Save timesheet to backend and reload/refresh the overview.
    function onTimesheetSave( timesheet ) {
        app.debug( 'Dispatcher.onTimesheetSave()' );
        app.debug( timesheet );

        $.when( STIBO.dataService.saveTimesheet( timesheet ) )
            .then( function () {
                $.Topic( 'notification.timesheet.saved' ).publish();
                return dataService.getTimesheetOverview()
            } )
            .then( function ( data ) {

                app.currentEmployee = null;
                app.currentTimesheet = null;
                //$.Topic( 'notification.timesheet.clear' ).publish();

                // update data so that individual week objects have a reference to the employee object (week.employee = employee)
                for ( var i = 0; i < data.employees.length; i++ ) {
                    for ( var j = 0; j < data.employees[i].weeks.length; j++ ) {
                        data.employees[i].weeks[j].employee = data.employees[i].employee;
                    }
                }
                $.Topic( 'notification.timesheetoverview.loaded' ).publish( data );
            } )
            .fail( function ( jqXhr ) {
                //TODO: show pretty error message...
                alert( jqXhr.responseJSON.errorMessage );
            } );

    }

};

STIBO.Timesheet.timesheetFactory = function (employeeId, timesheetId, weekNum, historyVersion) {

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
                function ( data ) { employee = data;}
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
            })
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

STIBO.Timesheet.Application = function ( $settings, configuration ) {
    var self = this;

    self.user = null;
    self.currentEmployee = null;
    self.currentTimesheet = null;

    //self.getUserRole = function () {
    //    return self.user.role;
    //};

    self.debug = function ( message ) {
        if ( $settings.debugActive === true ) {
            if ( _.isString( message ) )
                console.log( message );
            else
                console.dir( message );
        }
    };

    function reset() {
        self.user = null;
        self.currentEmployee = null;
        self.currentTimesheet = null;
    }

    $.Topic( 'notification.user.loggedin' ).subscribe( function ( user ) {
        self.user = user;
    } );
    $.Topic( 'notification.user.loggedout' ).subscribe( reset );

    //$.Topic( 'notification.timesheet.selected' ).subscribe( function ( timesheet ) { self.timesheet = timesheet; } );
};


( function () {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "positionClass": "toast-bottom-right",
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    $.Topic( 'notification.timesheet.saved' ).subscribe( function () { toastr.success( "Ugeseddel er blevet gemt." ); } );
    $.Topic( 'notification.user.loggedin' ).subscribe( function () { toastr.success( "Du er nu logget på systemet." ); } );
    $.Topic( 'notification.user.loggedout' ).subscribe( function () { toastr.info( "Du er nu logget ud af systemet." ); } );
} )();


$( function () {

    var root = STIBO.Timesheet,
        app = new root.Application(root.Settings, root.Configuration),
        dispatcher = new root.Dispatcher( app );

    app.loginViewModel = new root.LoginViewModel( app );
    app.loginViewModel.bind( document.getElementById( 'LoginView' ) );

    app.userViewModel = new root.UserViewModel( app );
    app.userViewModel.bind( document.getElementById( 'UserView' ) );

    app.timesheetOverviewViewModel = new root.TimesheetOverviewViewModel( app );
    app.timesheetOverviewViewModel.bind( document.getElementById( 'TimesheetOverviewView' ) );

    app.timesheetViewModel = new root.TimesheetViewModel( app );
    app.timesheetViewModel.bind( document.getElementById( 'TimesheetView' ) );


} );
