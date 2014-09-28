/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.viewModels = STIBO.viewModels || {};

STIBO.viewModels.TimesheetLine = function ( parent, data ) {
    var utils = STIBO.utils,
        self = this;

    this.id = utils.default( data.id );
    this.timesheetId = utils.default( data.timesheetId );
    this.type = utils.default( data.type );
    this.description = utils.default( data.description );
    this.sunday = utils.default( data.sunday, 0 );
    this.monday = utils.default( data.monday, 0 );
    this.tuesday = utils.default( data.tuesday, 0 );
    this.wednesday = utils.default( data.wednesday, 0 );
    this.thursday = utils.default( data.thursday, 0 );
    this.friday = utils.default( data.friday, 0 );
    this.saturday = utils.default( data.saturday, 0 );

    this.getTotal = function () {
        var total = parseFloat( this.sunday ) +
            parseFloat( this.monday ) +
            parseFloat( this.tuesday ) +
            parseFloat( this.wednesday ) +
            parseFloat( this.thursday ) +
            parseFloat( this.friday ) +
            parseFloat( this.saturday );

        //if ( self.type === 'G' ) {
        //    // Ferie
        //    parent.header.restFerie = 
        //}

        return utils.toNumber( total, 2 );
        //if (_.isNaN(total) || _.isNumber(total))
        //return total.toFixed(2);
    };

    this.getSunday = function () {
        return self.sunday;
    };
    //ko.defineProperty( this, 'isValid', function () {

    //} );

    this.hasError = function () {
        return false;
    };

    //ko.defineProperty( this, 'hasError', function () {
    //    return false;
    //} );

    this.isDirty = function () {
        return (
            self.sunday != utils.default( data.sunday, 0 ) ||
            self.monday != utils.default( data.monday, 0 ) ||
            self.tuesday != utils.default( data.tuesday, 0 ) ||
            self.wednesday != utils.default( data.wednesday, 0 ) ||
            self.thursday != utils.default( data.thursday, 0 ) ||
            self.friday != utils.default( data.friday, 0 ) ||
            self.saturday != utils.default( data.saturday, 0 )
        );
    };

    //this.getColumnHours = function ( columnName ) {
    //    var column = self[columnName],
    //        value = 0;
        
    //    if ( self.getConfig().sumColumn !== false ) {
    //        if ( _.isFunction( column ) ) {
    //            //value = column();
    //        }
    //        else {
    //            value = column;
    //        }
    //    }

    //    return parseFloat( value );
    //};

    this.getConfig = function () {
        return STIBO.Timesheet.Configuration.lines.getLine( parent.header.location, self.type );
    };

    ko.track( self );

};