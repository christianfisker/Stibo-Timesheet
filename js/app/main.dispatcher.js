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
            } )
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
    }

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

    }

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

// load complete employee
//loadEmployee( employee.id ); // load complete employee data

//if ( week.id === null ) {
//    // Blank timesheet so we must create it from scratch.
//    createTimesheet( employee, week ); // TODO: not completed... wrong employee object...
//}
//else {
//    loadTimesheet( week.id );
//}

//$.Topic( 'notification.timesheet.loaded' ).subscribe(
//    function ( timesheet ) {
//        app.debug( timesheet );
//    } ); // TESTING
