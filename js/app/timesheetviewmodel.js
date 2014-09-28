/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="configuration.js" />
/// <reference path="timesheetlineviewmodel.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};


//
// TimesheetViewModel
//  Controller for the timesheet detail view. 
//
// Publishes:
//      $.Topic( 'timesheet.clear' ).publish();
//      $.Topic( 'timesheet.save' ).publish();
//
// Subscribes:
//      $.Topic( 'notification.timesheet.loaded' ).subscribe( view );
//      $.Topic( 'notification.timesheet.saved' ).subscribe( reset );
//      $.Topic( 'notification.timesheetoverview.canselect' ).subscribe( subscriberCanCloseCurrent );
//      $.Topic( 'notification.user.canlogout' ).subscribe( subscriberCanCloseCurrent );
//      $.Topic( 'notification.user.loggedout' ).subscribe( reset );
//
STIBO.Timesheet.TimesheetViewModel = function ( app ) {
    app.debug( 'TimesheetViewModel()' );

    var self = this,
        boundElement = null,
        isBound = false;

    self.app = app;
    self.userRole = ko.observable(0);

    // original model data
    self.employee = null;
    self.timesheet = null;

    self.employeeId = ko.observable();
    self.employeeName = ko.observable();
    self.week = ko.observable();
    self.location = ko.observable();

    // changeable fields
    self.machine = ko.observable( null );
    self.shift = ko.observable( null );
    self.hasLeadPressSupplement = ko.observable( false );
    self.comment = ko.observable( '' );

    self.state = ko.observable();
    self.lines = ko.observableArray( [] ); 

    // 
    self.selectShift = function ( shift, event ) {
        if ( self.isOpen() )
            self.shift( shift.id );
    };

    self.selectMachine = function ( machine, event ) {
        if ( self.isOpen() )
            self.machine( machine.id );
    };

    // Display fields
    self.weekNumber = function () {
        return self.week().substring( 4 );
    };

    self.statusName = function () {
        return self.state();
    };

    // calculated fields
    self.brugtFerie = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.brugtFerie()' );

        var hours = 0,
            line = STIBO.utils.find( self.lines(), 'type', 'G' ),
            shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

        if ( _.isObject(line) && _.isObject(shift) ) {
            hours = line.totalForLine() * shift.factor;
        }

        return hours.toFixed( 2 );
    } );

    self.restFerie = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.restFerie()' );

        return (self.employee.saldoFerie - parseFloat(self.brugtFerie())).toFixed(2);
    } );

    self.brugtFerieFri = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.brugtFerieFri()' );

        var hours = 0,
            line = STIBO.utils.find( self.lines(), 'type', 'H' ),
            shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

        if ( _.isObject( line ) && _.isObject( shift ) ) {
            hours = line.totalForLine() * shift.factor;
        }

        return hours.toFixed( 2 );
    } );

    self.restFerieFri = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.restFerieFri()' );

        return ( self.employee.saldoFerieFri - parseFloat( self.brugtFerieFri() ) ).toFixed( 2 );
    } );

    self.brugtAfspadsering = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.brugtAfspadsering()' );

        var hours = 0,
            line = STIBO.utils.find( self.lines(), 'type', 'E' ),
            shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

        if ( _.isObject( line ) && _.isObject( shift ) ) {
            hours = line.totalForLine() * shift.factor;
        }

        return hours.toFixed( 2 );
    } );

    self.restAfspadsering = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.restAfspadsering()' );

        return ( self.employee.saldoAfspadsering - parseFloat( self.brugtAfspadsering() ) ).toFixed( 2 );
    } );

    self.brugtGene = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.brugtGene()' );

        var hours = 0,
            line = STIBO.utils.find( self.lines(), 'type', 'F' ),
            shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

        if ( _.isObject( line ) && _.isObject( shift ) ) {
            hours = line.totalForLine() * shift.factor;
        }

        return hours.toFixed( 2 );
    } );

    self.restGene = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.restGene()' );

        return ( self.employee.saldoGene - parseFloat( self.brugtGene() ) ).toFixed( 2 );
    } );

    //# region - configuration

    self.machines = ko.pureComputed( function () {
        return STIBO.Timesheet.Configuration.machines.getLocation( self.location() );
    } );

    self.shifts = ko.pureComputed( function () {
        return STIBO.Timesheet.Configuration.shifts.getLocation( self.location() );
    } );

    //# end region - configuration

    // total hours for whole timesheet. iterates over lines and sums the line totals.
    self.total = ko.pureComputed( function () {
        app.debug( 'TimesheetViewModel.total()' );

        var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet() }, 0 );
        return STIBO.utils.numberToHours( total, true );
    } );

    self.getLineConfig = function ( type ) {
        return STIBO.Timesheet.Configuration.lines.getLine( self.employee.location, type );
        //return app.getLineConfig( self.employee.location, type );
    };

    // Is this viewmodel bound to a view?
    self.isBound = ko.observable( false );

    //# region - visuals/styles

    // Get a background color depending on entered hours compared with norm hours, as defined by the selected shift.
    self.getTotalBackgroundColor = ko.pureComputed(function () {
        app.debug( 'TimesheetViewModel.getTotalBackgroundColor()' );
        var shiftTmp = self.shift(); // debug
        // requirements
        if ( self.shift() === null )
            return;

        var normHours = 0,
            totalHours = 0;

        var shift = STIBO.utils.find( self.shifts(), 'id', self.shift() );

        normHours = shift.hours;
        totalHours = parseFloat( self.total() );
        totalHours = isNaN( totalHours ) ? 0 : totalHours;

        if ( totalHours === normHours )
            return 'green';

        return totalHours < normHours ? 'red' : 'yellow';
    } );

    //self.formatHours = function ( input ) {
    //    var output = isNaN( input ) ? 0 : parseFloat( input );
    //    if ( output === 0 )
    //        return '';
    //    return output.toFixed( 2 );
    //};

    self.isOpen = ko.pureComputed( function () {
        return self.state() !== 'CLOSED';
    } );

    self.isClosed = ko.pureComputed( function () {
        return self.state() === 'CLOSED';
    } );

    //# end region - visuals/styles

    // -1 = below, 0 = norm, 1 = above
    self.compareNormHours = ko.pureComputed(function(){
        if ( self.shift() === null )
            return 0;

        var norm = STIBO.utils.find( self.shifts(), 'id', self.shift() ).hours,
            total = self.total();

        return total < norm ? -1 : total > norm ? 1 : 0;
    });

    //# region - interface
    self.isVisible = ko.observable( false );

    self.onBtnSave = function () {
        app.debug( 'TimesheetViewModel.onBtnSave()' );

        save();
    };

    function save() {
        if ( isDirty() ) {
            var timesheet = self.getData( true );

            timesheet.state = 'OPEN';
            
            $.Topic( 'timesheet.save' ).publish( timesheet );
        }
        else {
            clear();
        }
    }

    self.onBtnSubmit = function () {
        app.debug( 'TimesheetViewModel.onBtnSubmit()' );

        // Der kan submittes uanset om noget er ændret...
        submit();
    };

    function submit() {

        var allowSave = false,
            timesheet = self.getData( true );

        if ( app.user.role === 1 && validate(true) === true ) {

            timesheet.state = 'SUBMITTED';
            allowSave = true;

        }
        else if ( app.user.role === 2 ) {

            // er der registreret normtid?
            if ( self.compareNormHours() === 0 && validate() === true )
                timesheet.state = 'APPROVED';
            else
                timesheet.state = 'APPROVEDTENTATIVE';

            allowSave = true;
        }
        else if ( app.user.role === 3 ) {
            timesheet.state = 'CLOSED';
            allowSave = true;
        }

        if ( allowSave ) {
            $.Topic( 'timesheet.save' ).publish( timesheet );
        }
    }


    function validate( verbose ) {
        var ok = true,
            errorList = [];

        function isStringNotEmpty( value ) {
            return _.isString( value ) && value.length > 0;
        }

        function isStringEmpty( value ) {
            return !_.isString( value ) || value.length === 0;
        }

        // 1. Er der valgt en maskine (machine)?
        // 2. Er der valgt et skift (shift)?

        //ok = self.header.validate( errorList ) && ok;

        if ( self.machines().length > 0 && isStringEmpty( self.machine() ) ) {
            errorList.push( 'Der er ikke valgt nogen maskine.' );
            ok = false;
        }

        if ( isStringEmpty( self.shift() ) ) {
            errorList.push( 'Der er ikke valgt noget skift.' );
            ok = false;
        }


        if ( !ok && errorList.length > 0 && verbose === true ) {
            var message = '';
            for ( var i = 0; i < errorList.length; i++ ) {
                message += errorList[i] + '\n';
            }

            alert( message );
        }

        return ok;
    }

    self.onBtnCancel = function () {
        app.debug( 'TimesheetViewModel.onBtnCancel()' );

        if ( isDirty() ) {
            if ( confirm('Vil du annullere de ændringer der er lavet?') ) {
                clear();
            }
        }
        else {
            clear();
        }
    };

    function clear() {
        reset();
        $.Topic( 'timesheet.clear' ).publish();
    }

    self.onBtnLoadEmployeeVersion = function () {
        app.debug( 'TimesheetViewModel.onBtnLoadEmployeeVersion()' );
        $.Topic( 'timesheet.history.getversion' ).publish( self.timesheet.id, self.timesheet.week, 1 );
    };

    self.onBtnLoadApproverVersion = function () {
        app.debug( 'TimesheetViewModel.onBtnLoadApproverVersion()' );
        $.Topic( 'timesheet.history.getversion' ).publish( self.timesheet.id, self.timesheet.week, 2 );
    };

    self.onBtnLoadPayrollVersion = function () {
        app.debug( 'TimesheetViewModel.onBtnLoadPayrollVersion()' );
        $.Topic( 'timesheet.history.getversion' ).publish( self.timesheet.id, self.timesheet.week, 3 );
    };

    //# end region - interface

    // True if the timesheet has been changed by the user.
    function isDirty() {
        app.debug( 'TimesheetViewModel.isDirty()' );

        var flag = false;

        if ( self.timesheet === null )
            return flag;

        flag =
            self.machine() != self.timesheet.machine ||
            self.shift() != self.timesheet.shift ||
            self.hasLeadPressSupplement() != self.timesheet.hasLeadPressSupplement ||
            self.comment() != self.timesheet.comment;

        // check lines
        flag = flag || _.some( self.lines(), function ( line ) {
            return line.isDirty();
        } );

        return flag;
    };

    self.getData = function ( _isDirty ) {
        app.debug( 'TimesheetViewModel.getData()' );

        var lines = [];

        //Der er vist ikke behov for at undersøge for 'dirtyness'...
        //if ( _isDirty === true || isDirty() ) {

            self.timesheet.machine = self.machine();
            self.timesheet.shift = self.shift();
            self.timesheet.comment = self.comment();
            self.timesheet.hasLeadPressSupplement = self.hasLeadPressSupplement();

            lines = _.map( self.lines(), function ( line ) { return line.getData(); } );
            self.timesheet.lines = lines;
        //}

        return self.timesheet;
    };

    self.bind = function ( element ) {
        app.debug( 'TimesheetViewModel.bind()' );

        boundElement = element;
    };

    function view( employee, timesheet ) {
        app.debug( 'TimesheetViewModel.view()' );
        //app.debug( employee );

        self.timesheet = timesheet;
        self.employee = employee;

        self.employeeId( employee.id );
        self.employeeName( employee.name );
        self.week( timesheet.week );
        self.location( timesheet.location );
        self.machine( timesheet.machine );
        self.shift( timesheet.shift );
        self.hasLeadPressSupplement( timesheet.hasLeadPressSupplement );
        self.comment( timesheet.comment );
        self.lines( _.map( timesheet.lines, function ( line ) { return new STIBO.Timesheet.TimesheetLineViewModel( app, self, line ) } ) );

        self.userRole( app.user.role );
        self.state( timesheet.state );

        if ( !isBound ) {
            ko.applyBindings( self, boundElement );
            isBound = true;
        }

        self.isVisible( true );
    }

    function subscriberCanCloseCurrent( deferred ) {
        if ( isBound && isDirty() ) {
            if ( confirm('Vil du annullere de ændringer der er lavet?') ) {
                deferred.resolve();
            }
            else {
                deferred.reject();
            }
            //// show dialog
            //alert( 'No you cannot.Timesheet is dirty!' );
            //deferred.reject('existing timesheet is dirty...');
        }
        else {
            deferred.resolve();
        }
    }

    function reset() {

        self.employee = null;
        self.timesheet = null;
        self.shift( null );
        self.machine( null );

        if ( isBound ) {
            self.isVisible( false );
        }
    }

    //$.Topic( 'notification.user.loggedin' ).subscribe( function ( user ) { self.user( user ); } );
    $.Topic( 'notification.timesheet.loaded' ).subscribe( view );
    $.Topic( 'notification.timesheetoverview.canselect' ).subscribe( subscriberCanCloseCurrent );
    $.Topic( 'notification.timesheet.saved' ).subscribe( reset );
    $.Topic( 'notification.user.canlogout' ).subscribe( subscriberCanCloseCurrent );
    $.Topic( 'notification.user.loggedout' ).subscribe( reset );
};
