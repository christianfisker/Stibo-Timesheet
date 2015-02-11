/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.dataservice.js" />
/// <reference path="stibo.timesheet.userviewmodel.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};

//
// TimesheetOverviewModel
//  
//
// Publishes:
//      timesheetoverview.onselected
//      timesheet.clear
//
// Subscribes:
//      notification.user.loggedout
//      notification.timesheetoverview.loaded
//      notification.timesheet.loaded
//      notification.timesheet.clear
//
STIBO.Timesheet.TimesheetOverviewViewModel = function ( app ) {
    app.debug( 'new TimesheetOverviewViewModel()' );

    var self = this;

    self.app = app;

    self.isVisible = ko.observable( false );
    self.weekRange = ko.observableArray();
    self.employees = ko.observableArray();
    self.currentWeek = null;

    self.isEmployeeVisible = function ( employee ) {
        app.debug( 'timesheetOverviewViewModel.isEmployeeVisible()' );

        return ( self.app.currentEmployee === null || employee.id === self.app.currentEmployee.id );
    };


    //region - events

    self.onWeekSelected = function ( week, event ) {
        app.debug( 'timesheetOverviewViewModel.onWeekSelected() - (' + week.week + ', {' + week.id + '})' );

        $.Topic( 'timesheetoverview.onselected' ).publish( week );
    };

    // TESTING
    self.testClearSelected = function () {
        $.Topic( 'timesheet.clear' ).publish();
    };


    //region - styling

    self.styleHeaderColumnCSS = function ( week ) {
        var ret = week === self.currentWeek ? ' currentWeek currentWeekLeft currentWeekRight' : '';
        return ret;
    };

    self.styleBodyColumnCSS = function ( timesheet ) {
        var ret = timesheet.status + ( timesheet.week === self.currentWeek ? ' currentWeekLeft currentWeekRight' : '' );
        return ret;
    };

    self.bind = function ( element ) {
        ko.applyBindings( self, element );
    };

    //region - internal functions

    function reset() {
        self.isVisible( false );
        self.weekRange(null);
        self.employees( null );
        self.currentWeek = null;
    }

    function refresh() {
        // Dirty refresh since valueHasMutated() does not apparently work!
        var array = self.employees();
        self.employees( null );
        self.employees( array );

        //self.employees.valueHasMutated();
    }

    function onLoaded( overview ) {
        app.debug( 'timesheetOverviewViewModel.onLoaded()' );

        self.currentWeek = overview.weekRange.currentWeek;
        self.weekRange( overview.weekRange.sequence );
        self.employees( overview.employees );

        self.isVisible( true );
    }

    $.Topic( 'notification.user.loggedout' ).subscribe( reset );
    //$.Topic( 'notification.timesheet.loaded' ).subscribe( function ( overview ) {
    //    self.app.debug( "subscriber - notification.timesheet.loaded " );
    //    onLoaded( overview );
    //} );
    $.Topic( 'notification.timesheetoverview.loaded' ).subscribe( onLoaded );
    $.Topic( 'notification.timesheet.loaded' ).subscribe( refresh );
    //$.Topic( 'notification.timesheet.all' ).subscribe( function () { alert( 'loaded' ); } );
    $.Topic( 'notification.timesheet.clear' ).subscribe( refresh );
};
