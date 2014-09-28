/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.dataService.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.viewModels = STIBO.viewModels || {};

//
// User
// (kunne måske blot være en model og så lade LoginViewModel afgøre om der er noget der skal track'es)
//
// Publishes:
//
// Subscriptions:
//      login.loggedIn
//      login.loggedOut
//
STIBO.viewModels.UserViewModel = function () {
    var self = this;

    this.name = '';
    this.role = '';
    this.isLoggedIn = false;

    this.reset = function () {
        self.name = '';
        self.role = '';
        self.isLoggedIn = false;
    };

    this.getCurrentUser = function () {
        $.when( STIBO.dataService.getCurrentUser() )
            .done( function ( data ) {
                self.name = data.name;
                self.role = data.role;
                self.isLoggedIn = true;
            } );
    };

    this.onLogin = function () {
        console.log( "User.onLogin - subscriber" );
        self.getCurrentUser();
    };

    this.onLogout = function () {
        console.log( "User.onLogout - subscriber" );
        self.reset();
    };

    $.Topic( 'login.loggedIn' ).subscribe( this.onLogin );
    $.Topic( 'login.loggedOut' ).subscribe( this.onLogout );

    ko.track( this );
};