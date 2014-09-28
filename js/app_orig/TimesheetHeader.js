/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.viewModels = STIBO.viewModels || {};

STIBO.viewModels.TimesheetHeader = function ( parent, data ) {
    var utils = STIBO.utils,
        self = this,
        p = { total: 0 };

    self.id = utils.default( data.id );
    self.employeeId = utils.default( data.employeeId );
    self.location = utils.default( data.location );
    self.week = utils.default( data.week );
    self.shift = utils.default( data.shift );
    self.machine = utils.default( data.machine );
    self.comment = utils.default( data.comment );
    self.hasLeadPressSupplement = utils.default( data.hasLeadPressSupplement );
    self.modifiedDate = utils.default( data.modifiedDate );

    self.restFerie = function () {
        // find ferie linjen
        var line = utils.find( parent.lines, 'Type', 'G' );
        //if ( _.isObject( line ) ) {
        //    return parent.employee.saldoFerie - line.total();
        //}
        return parent.employee.saldoFerie - ( _.isObject( line ) ? line.getTotal() : 0 );
    };

    self.restFerieFri = function () {
        // find ferie linjen
        var line = utils.find( parent.lines, 'Type', 'H' );
        return parent.employee.saldoFerieFri - ( _.isObject( line ) ? line.getTotal() : 0 );
    };

    self.validate = function ( errorList ) {
        var ok = true

        if ( _.isEmpty( self.machine ) ) {
            errorList.push( 'Der er ikke valgt nogen maskine.' );
            ok = false;
        }

        if ( _.isEmpty( self.shift ) ) {
            errorList.push( 'Der er ikke valgt noget skift.' );
            ok = false;
        }

        return ok;
    };

    //this.sumIsOk = function () {
    //    return true; // TODO: Must fix...
    //};

    self.isDirty = function () {
        console.log( 'header.isDirty()' );

        return (
            self.shift != utils.default( data.shift ) ||
            self.machine != utils.default( data.machine ) ||
            self.hasLeadPressSupplement != utils.default( data.hasLeadPressSupplement ) ||
            self.comment != utils.default( data.comment )
        );
    };

    self.getColumnTotal = function ( columnName ) {
        console.log( 'header.getColumnTotal()' );

        var total = 0,
            lines = parent.lines,
            line = 0;

        for ( var i = 0; i < lines.length; i++ ) {
            line = lines[i];

            if ( line.getConfig().sumColumn !== false ) {
                //total += line[columnName]; //TODO: denne returnerer stren, når feltet er ændret!
                total += parseFloat(line[columnName]); //TODO: denne returnerer stren, når feltet er ændret!
            }
        }

        return total.toFixed( 2 );
    }

    // Get total hours registered on this timesheet.
    self.getTotal = function () {
        console.log( 'header.getTotal()' );

        var total = 0,
            lines = parent.lines,
            line = 0;

        for ( var i = 0; i < lines.length; i++ ) {
            line = lines[i];

            if ( line.getConfig().sumColumn !== false ) {
                total += line.getTotal();
            }
        }

        p.total = total.toFixed( 2 );
        return p.total;
    };

    // Get a background color depending on entered hours compared with norm hours, as defined by the selected shift.
    self.getTotalBackgroundColor = function () {
        console.log( 'header.getTotalBackgroundColor()' );

        // requirements
        if ( self.shift === null )
            return;

        var normHours = 0,
            totalHours = 0;

        var shift = utils.find( parent.shifts, 'id', self.shift );

        normHours = shift.hours; //parent.findShift( self.shift ).hours;
        totalHours = p.total;

        if ( totalHours === normHours ) 
            return 'green';

        return totalHours < normHours ? 'red' : 'yellow';
    };

    ko.track( self );
};