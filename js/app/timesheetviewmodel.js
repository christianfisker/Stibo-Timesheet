﻿/// <reference path="../libs/jquery.min.js" />
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
    app.debug( 'new TimesheetViewModel()' );

    var self = this,
        boundElement = null,
        isBound = false;

    self.app = app;
    self.userRole = ko.observable(0);

    // original model data
    self.employee = null;
    self.timesheet = null;

    self.employeeSaldoFerie = ko.observable(); // 20141103
    self.employeeSaldoFerieFri = ko.observable(); // 20141103
    self.employeeSaldoAfspadsering = ko.observable(); //20141103
    self.employeeSaldoAfspadseringEgne = ko.observable(); //20150312 cfi/columbus - Bruges kun af CPV
    self.employeeSaldoAfspadseringTillaeg = ko.observable();  //20150312 cfi/columbus - Bruges kun af CPV
    self.employeeSaldoGene = ko.observable();  //20150312 cfi/columbus - Bruges kun af SGT

    self.employeeId = ko.observable();
    self.employeeName = ko.observable();
    self.week = ko.observable();
    self.location = ko.observable();

    self.modifiedByName = ko.observable(); // 20141124 - timesheet.modifiedByName

    // changeable fields
    self.machine = ko.observable( null );
    self.shift = ko.observable( null );
    self.hasLeadPressSupplement = ko.observable(false);

    self.forlaegning = ko.observable( null ); // 20150217
    //self.treForlaegning = ko.observable(false); // 20150211
    //self.fireForlaegning = ko.observable(false); // 20150211
    //self.femForlaegning = ko.observable(false); // 20150211
    //self.raadighedsvagt = ko.observable(false); // 20150211

    self.comment = ko.observable( '' );

    self.state = ko.observable();
    self.lines = ko.observableArray( [] ); 

    // Returns an array of available shifts depending on the selected machine/team.
    self.teamShifts = ko.pureComputed( function () {
        app.debug( 'timesheetViewModel.teamShifts()' );

        var allShifts = STIBO.Timesheet.Configuration.shifts.getLocation( self.location() );
        var machine = self.machine();
        
        if ( machine === null ) {
            return [];
        }
        else {
            return _.filter( allShifts, function ( shift ) { return shift.teamId === machine.teamId; } );
        }
    } );

    // Frontend event - machine/team selected.
    self.selectMachine = function ( machine, event ) {
        app.debug( 'timesheetViewModel.selectMachine(...)' );

        var currMachine;

        if ( self.isOpen() ) {
            currMachine = self.machine();
            if ( currMachine === null || currMachine.id !== machine.id ) {
                self.machine( machine );
                self.shift( null );
            }
        }
    };

    // Frontend event - shift selected.
    self.selectShift = function ( shift, event ) {
        app.debug( 'timesheetViewModel.selectShift(...)' );

        if ( self.isOpen() )
            self.shift( shift.id );
    };


    // Display fields
    self.weekNumber = function () {
        return self.week().substring( 4 );
    };

    self.statusName = function () {
        return self.state();
    };

    // calculated fields - Bruges ikke endnu.
    //self.brugtFerie = ko.pureComputed( function () {
    //    app.debug( 'timesheetViewModel.brugtFerie()' );

    //    var hours = 0,
    //        line = STIBO.utils.find( self.lines(), 'type', 'G' ),
    //        shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

    //    if ( _.isObject(line) && _.isObject(shift) ) {
    //        hours = line.totalForLine() * shift.factor;
    //    }

    //    return hours.toFixed( 2 );
    //} );

    //self.restFerie = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.restFerie()' );

    //    return (self.employee.saldoFerie - parseFloat(self.brugtFerie())).toFixed(2);
    //} );

    //self.brugtFerieFri = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.brugtFerieFri()' );

    //    var hours = 0,
    //        line = STIBO.utils.find( self.lines(), 'type', 'H' ),
    //        shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

    //    if ( _.isObject( line ) && _.isObject( shift ) ) {
    //        hours = line.totalForLine() * shift.factor;
    //    }

    //    return hours.toFixed( 2 );
    //} );

    //self.restFerieFri = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.restFerieFri()' );

    //    return ( self.employee.saldoFerieFri - parseFloat( self.brugtFerieFri() ) ).toFixed( 2 );
    //} );

    //self.brugtAfspadsering = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.brugtAfspadsering()' );

    //    var hours = 0,
    //        line = STIBO.utils.find( self.lines(), 'type', 'E' ),
    //        shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

    //    if ( _.isObject( line ) && _.isObject( shift ) ) {
    //        hours = line.totalForLine() * shift.factor;
    //    }

    //    return hours.toFixed( 2 );
    //} );

    //self.restAfspadsering = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.restAfspadsering()' );

    //    return ( self.employee.saldoAfspadsering - parseFloat( self.brugtAfspadsering() ) ).toFixed( 2 );
    //} );

    //self.brugtGene = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.brugtGene()' );

    //    var hours = 0,
    //        line = STIBO.utils.find( self.lines(), 'type', 'F' ),
    //        shift = STIBO.Timesheet.Configuration.shifts.getShift( self.location(), self.shift() );

    //    if ( _.isObject( line ) && _.isObject( shift ) ) {
    //        hours = line.totalForLine() * shift.factor;
    //    }

    //    return hours.toFixed( 2 );
    //} );

    //self.restGene = ko.pureComputed( function () {
    //    app.debug( 'TimesheetViewModel.restGene()' );

    //    return ( self.employee.saldoGene - parseFloat( self.brugtGene() ) ).toFixed( 2 );
    //} );

    //# region - configuration

    // Returns all machines. This does not changes so should not need to be computed! TODO!!
    self.machines = ko.pureComputed( function () {
        return STIBO.Timesheet.Configuration.machines.getLocation( self.location() );
    } );

    self.shifts = ko.pureComputed( function () {
        return STIBO.Timesheet.Configuration.shifts.getLocation( self.location() );
        //var machine = self.machine();
        //var teamShifts = [];

        //if ( machine !== null ) {
        //    var allShifts = STIBO.Timesheet.Configuration.shifts.getLocation( self.location() );
        //    teamShifts = _.filter( allShifts, function ( shift ) { return shift.teamId === machine.teamId; } );
        //}

        //return teamShifts;
    } );

    //# end region - configuration

    // total hours for whole timesheet. iterates over lines and sums the line totals.
    self.total = ko.pureComputed( function () {
        app.debug( 'timesheetViewModel.total()' );

        // 20150224 cfi/columbus
        var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet( 'hours' ) }, 0 );
        //var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet() }, 0 );

        // 20150224 cfi/columbus
        return total;
        //return STIBO.utils.numberToHours( total, true );
    } );

    // Total hours registered for sumGroup 'hours'. Normal hours used by all users.
    self.totalHours = ko.pureComputed( function () {
        app.debug( 'timesheetViewModel.total()' );

        // 20150211
        var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet( 'hours' ) }, STIBO.Timesheet.Configuration.initialHoursOnTimesheet );
        //var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet( 'hours' ) }, 0 );

        return STIBO.utils.numberToHours(total, true);
    } );

    // Total hours registered for sumGroup 'markup1'. Used by 'Bogbind' users.
    self.totalSupplement1Hours = ko.pureComputed( function () {
        app.debug( 'timesheetViewModel.totalSupplement1Hours()' );

        var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet( 'supplement1' ) }, 0 );
        return STIBO.utils.numberToHours( total, true );
    } );

    // Total hours registered for sumGroup 'markup2'. Used by 'Bogbind' users.
    self.totalSupplement2Hours = ko.pureComputed( function () {
        app.debug( 'timesheetViewModel.totalSupplement2Hours()' );

        var total = _.reduce( self.lines(), function ( memo, line ) { return memo + line.totalForTimesheet( 'supplement2' ) }, 0 );
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
        app.debug( 'timesheetViewModel.getTotalBackgroundColor()' );

        // 20150211 - No color coding of total hours for CPV.
        if ( STIBO.Timesheet.Configuration.companyCode === 'CPV' )
            return;

        // requirements
        if ( self.shift() === null )
            return;

        var normHours = 0,
            totalHours = 0;

        var shift = STIBO.utils.find( self.shifts(), 'id', self.shift() );

        normHours = shift.hours;
        //totalHours = parseFloat( self.total() );
        totalHours = parseFloat( self.totalHours() );
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
        else if ( app.user.role === 3 && validate(true) === true ) {
            timesheet.state = 'CLOSED';
            allowSave = true;
        }

        if ( allowSave ) {
            $.Topic( 'timesheet.save' ).publish( timesheet );
        }
    }


    function validate( verbose ) {
        app.debug( 'timesheetViewModel.validate( ' + verbose + ' )' );

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

        //if ( self.machines().length > 0 && isStringEmpty( self.machine() ) ) {
        if ( self.machines().length > 0 && self.machine() === null ) {

            if ( self.location() === 'Bogbind' ) {
                errorList.push( 'Der er ikke valgt hold/tur.' );
            }
            else {
                errorList.push( 'Der er ikke valgt maskine.' );
            }

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
        app.debug( 'timesheetViewModel.onBtnLoadPayrollVersion()' );
        $.Topic( 'timesheet.history.getversion' ).publish( self.timesheet.id, self.timesheet.week, 3 );
    };

    //# end region - interface

    // True if the timesheet has been changed by the user.
    function isDirty() {
        app.debug( 'timesheetViewModel.isDirty()' );

        var flag = false;

        if ( self.timesheet === null )
            return flag;

        flag =
            (self.machine() !== null && self.machine().id != self.timesheet.machine) ||
            //self.machine() != self.timesheet.machine ||
            self.shift() != self.timesheet.shift ||
            self.hasLeadPressSupplement() != self.timesheet.hasLeadPressSupplement ||
            self.forlaegning() != self.timesheet.forlaegning || // 20150217
            //self.treForlaegning() != self.timesheet.treForlaegning ||   // 20150211
            //self.fireForlaegning() != self.timesheet.fireForlaegning || // 20150211
            //self.femForlaegning() != self.timesheet.femForlaegning ||   // 20150211
            //self.raadighedsvagt() != self.timesheet.raadighedsvagt ||   // 20150211
            self.comment() != self.timesheet.comment;

        // check lines
        flag = flag || _.some( self.lines(), function ( line ) {
            return line.isDirty();
        } );

        return flag;
    };

    self.getData = function ( _isDirty ) {
        app.debug( 'timesheetViewModel.getData()' );

        var lines = [];

        self.timesheet.machine = self.machine() === null ? null : self.machine().id;
        //self.timesheet.machine = self.machine();
        self.timesheet.shift = self.shift();
        self.timesheet.comment = self.comment();
        self.timesheet.hasLeadPressSupplement = self.hasLeadPressSupplement();

        self.timesheet.forlaegning = self.forlaegning(); // 20150217
        //self.timesheet.treForlaegning = self.treForlaegning();      // 20150211
        //self.timesheet.fireForlaegning = self.fireForlaegning();    // 20150211
        //self.timesheet.femForlaegning = self.femForlaegning();      // 20150211
        //self.timesheet.raadighedsvagt = self.raadighedsvagt();      // 20150211

        self.timesheet.supplement1Hours = STIBO.utils.hoursToNumber( self.totalSupplement1Hours() );
        self.timesheet.supplement2Hours = STIBO.utils.hoursToNumber( self.totalSupplement2Hours() );

        // Get updated timesheet lines.
        lines = _.map( self.lines(), function ( line ) { return line.getData(); } );

        // Remove 'null' lines. They represent lines that we dont want saved in the database.
        lines = _.filter( lines, function ( line ) {
            return line !== null;
        } );

        self.timesheet.lines = lines;

        return self.timesheet;
    };

    self.bind = function ( element ) {
        app.debug( 'timesheetViewModel.bind()' );

        boundElement = element;
    };

    function view( employee, timesheet ) {
        app.debug( 'timesheetViewModel.view()' );
        //app.debug( employee );

        self.timesheet = timesheet;
        self.employee = employee;

        self.employeeSaldoFerie( employee.saldoFerie ); // 20141103
        self.employeeSaldoFerieFri( employee.saldoFerieFri ); // 20141103
        self.employeeSaldoAfspadsering( employee.saldoAfspadsering ); //20141103
        self.employeeSaldoAfspadseringEgne( employee.saldoAfspadseringEgne ); // 20150312 cfi/columbus - Bruges kun af CPV
        self.employeeSaldoAfspadseringTillaeg( employee.saldoAfspadseringTillaeg ); // 20150312 cfi/columbus - Bruges kun af CPV
        self.employeeSaldoGene( employee.saldoGene ); // 20150312 cfi/columbus - Bruges kun af SGT

        self.employeeId( employee.id );
        self.employeeName( employee.name );
        self.week( timesheet.week );
        self.location( timesheet.location );
        self.machine( STIBO.Timesheet.Configuration.machines.getMachine( timesheet.location, timesheet.machine) );
        //self.machine( timesheet.machine );
        self.shift( timesheet.shift );
        self.hasLeadPressSupplement(timesheet.hasLeadPressSupplement);

        self.forlaegning( timesheet.forlaegning ); // 20150217
        //self.treForlaegning(timesheet.treForlaegning); // 20150211
        //self.fireForlaegning(timesheet.fireForlaegning); // 20150211
        //self.femForlaegning(timesheet.femForlaegning); // 20150211
        //self.raadighedsvagt(timesheet.raadighedsvagt); // 20150211

        self.comment(timesheet.comment);
        self.lines( _.map( timesheet.lines, function ( line ) { return new STIBO.Timesheet.TimesheetLineViewModel( app, self, line ) } ) );

        self.modifiedByName( timesheet.modifiedByName ); // 20141124

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
        app.debug( 'timesheetViewModel.reset()' );
        self.employee = null;
        self.timesheet = null;
        self.shift( null );
        self.machine( null );

        if ( isBound ) {
            self.isVisible( false );
        }
    }

    //$.Topic( 'notification.user.loggedin' ).subscribe( function ( user ) { self.user( user ); } );
    $.Topic( 'notification.timesheet.loaded' ).subscribe( function ( employee, timesheet ) { app.debug( "subscriber - notification.timesheet.loaded " ); view( employee, timesheet ); } );
    //$.Topic( 'notification.timesheet.loaded' ).subscribe( view );
    $.Topic( 'notification.timesheetoverview.canselect' ).subscribe( subscriberCanCloseCurrent );
    $.Topic( 'notification.timesheet.saved' ).subscribe( reset );
    $.Topic( 'notification.user.canlogout' ).subscribe( subscriberCanCloseCurrent );
    $.Topic( 'notification.user.loggedout' ).subscribe( reset );
};
