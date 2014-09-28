/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.timesheet.configuration.js" />
/// <reference path="stibo.timesheet.models.js" />

"use strict";


var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};


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
