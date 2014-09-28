/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.dataService.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.Timesheet = STIBO.Timesheet || {};

// 
// UserViewModel
//
// Publishes:
//      $.Topic( 'userviewmodel.onlogout' ).publish()
//
// Subscribes:
//      $.Topic( 'notification.user.loggedin' )
//      $.Topic( 'notification.user.loggedout' )
//
STIBO.Timesheet.UserViewModel = function ( app ) {
    var self = this;

    self.app = app;

    self.visible = ko.observable( false );
    self.name = ko.observable( '' );

    self.onLogout = function () {
        $.Topic( 'userviewmodel.onlogout' ).publish();
    };

    self.bind = function ( element ) {
        ko.applyBindings( self, element );
    };

    function setUser( user ) {
        self.name( user.name );
    };

    function reset() {
        self.visible( false );
        self.name( '' );
    }

    $.Topic( 'notification.user.loggedin' ).subscribe( function ( user ) {
        setUser( user );
        self.visible( true );
    } );

    $.Topic( 'notification.user.loggedout' ).subscribe( function () {
        reset();
    } );
};
