/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.dataService.js" />
/// <reference path="User.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.viewModels = STIBO.viewModels || {};

//
// TimesheetOverviewViewModel
//
// Publishes:
//      overview.timesheetSelected(employee, week, timesheetId)
//
// Subscribes:
//      login.loggedIn
//      login.loggedOut
//      detailsUpdated* - not implemented
//      details.closed()
//
STIBO.viewModels.TimesheetOverviewViewModel = function ( user ) {
    var self = this,
        priv = {},
        detail = null;

    this.user = user;
    this.weekRange = [];
    this.currentWeek = '';
    this.employees = [];
    this.currentEmployeeId = null;

    ko.defineProperty( this, 'isVisible', function () {
        console.log( "Overview.isVisible" );
        return self.user.isLoggedIn && self.employees.length > 0;
    } );

    // Subscription handler - Get related timesheet overview lines after a user is logged in.
    this.onLogin = function () {
        console.log( "Overview.onLogin - subscriber" );
        priv.reset();
        priv.getData();
    };

    // Subscription handler - Cleanup overview when the user is logged out.
    this.onLogout = function () {
        console.log( "Overview.onLogout - subscriber" );
        priv.reset();
    };

    this.onBtnRefresh = function () {
        priv.reset();
        priv.getData();
    };

    this.refresh = function () {
        priv.reset();
        priv.getData();
    };

    this.onSelectWeek = function ( week, event ) {
        console.dir( week );

        // Medarbejder linje er valgt.       
        self.currentEmployeeId = week.parent.employee.id;

        // Skal vi bruge Pub/Sub for at håndtere dette nemmest?
        //$.Topic( 'detailsSelected' ).publish( week.id );
        $.Topic( 'overview.timesheetSelected' ).publish( week.parent.employee, week );

        // 1.   Hvis der allerede er en uge under behandling, så skal det slet ikke være muligt at vælge en anden uge får den igangværende er afsluttet.
        //      Er der allerede en uge i fokus som ikke er blevet gemt?

        // 2.   Hent uge detaljer for den valgte uge.

        // 3.   Vis uge detaljer.
        //detail.load('cfi', week.id);
        //detail.load( week.parent.employee.id, week.id );
    };

    this.setDetailViewModel = function ( detailViewModel ) {
        detail = detailViewModel
    };

    this.styleHeaderColumnCSS = function ( week ) {
        var ret = week === self.currentWeek ? ' currentWeek currentWeekLeft' : '';
        return ret;
    };

    this.styleBodyColumnCSS = function ( timesheet ) {
        var ret = timesheet.status + ( timesheet.week === self.currentWeek ? ' currentWeekLeft' : '' );
        return ret;
    };

    priv.reset = function () {
        self.weekRange = null;
        self.employees = [];
        self.currentEmployeeId = null;
    };

    priv.getData = function ( filter ) {

        $.when(
                STIBO.dataService.getTimesheetOverview( filter )
            )
            .done(
                priv.mapResult
            )
            .always();
    };

    priv.mapResult = function ( data ) {

        //TODO: Validate data and show error if applicable...

        self.weekRange = data.weekRange.sequence;
        self.currentWeek = data.weekRange.currentWeek;

        for ( var i = 0; i < data.employees.length; i++ ) {
            data.employees[i].parent = self;
            ko.track( data.employees[i] );

            for ( var j = 0; j < data.employees[i].weeks.length; j++ ) {
                data.employees[i].weeks[j].parent = data.employees[i];
                ko.track( data.employees[i].weeks[j] );
            }
        }

        self.employees = data.employees;
    };

    //priv.mapResultOLD = function ( data ) {

    //    var lines = [],
    //        length = 0,
    //        idx = 0,
    //        employee = null,
    //        weeks = null,
    //        line = null;

    //    // TODO: Håndtering af fejl eller manglende data?

    //    self.settings = data.settings;
    //    lines = data.lines;
    //    length = data.lines.length;

    //    for ( idx = 0; idx < length; idx++ ) {
    //        employee = lines[idx].employee;
    //        weeks = lines[idx].weeks;

    //        // cleanup weeks, if weeks are missing or ID's are missing...
    //        //weeks = STIBO.utils.cleanupWeeks( self.weeks(), weeks );

    //        line = new STIBO.models.OverviewLine( employee, weeks );
    //        console.dir( line );
    //        self.lines.push( line );
    //    }

    //};

    ko.track( this );

    $.Topic( 'login.loggedIn' ).subscribe( this.onLogin );
    $.Topic( 'login.loggedOut' ).subscribe( this.onLogout );

    //$.Topic( 'overviewRefresh' ).subscribe( this.onBtnRefresh ); // TEMPORARY!!
    $.Topic( 'details.closed' ).subscribe( this.refresh );
};