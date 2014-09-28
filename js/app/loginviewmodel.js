/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.timesheet.dataservice.js" />
/// <reference path="stibo.timesheet.userviewmodel.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};

//
// Publishes:
//      'loginviewmodel.onlogin'
//
// Subscribes:
//      'notification.user.loggedin'
//      'notification.user.loggedout'
//      'notification.error.userlogin'
//
STIBO.Timesheet.LoginViewModel = function ( app ) {
    var self = this;

    self.app = app;

    self.username = ko.observable('');
    self.password = ko.observable('');
    self.hasFocus = ko.observable( true );
    self.visible = ko.observable( true );

    self.canSubmit = ko.pureComputed( function () {
        var flag = self.username().length > 0 && self.password().length > 0;
        return flag;
    } );

    self.onLogin = function () {
        var credentials = { username: self.username(), password: self.password() };
        $.Topic( 'loginviewmodel.onlogin' ).publish( credentials );
    };

    self.bind = function ( element ) {
        ko.applyBindings( self, element );
    };

    function reset() {
        self.username( '' );
        self.password( '' );
        self.visible( true );
        self.hasFocus( true );
    }

    $.Topic( 'notification.user.loggedin' ).subscribe( function () { self.visible( false ); } );
    $.Topic( 'notification.user.loggedout' ).subscribe( reset );

    $.Topic( 'notification.login.reset' ).subscribe( reset );
    $.Topic( 'notification.login.error' ).subscribe( function ( error ) {
        try{
            alert( error.message );
        }
        catch ( ex ) {
            alert( 'Fejl: fejlbeskeden kunne ikke vises (loginviewmodel - notification.error.userlogin)' );
        }
        
    } );

};
