/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.dataService.js" />
/// <reference path="User.js" />

"use strict";

var STIBO = window.STIBO || {};
STIBO.viewModels = STIBO.viewModels || {};

//
// LoginViewModel
//
// Publishes:
//      login.loggedIn()
//      login.loggedOut()
//
// Subscriptions:
//
STIBO.viewModels.LoginViewModel = function ( vmUser ) {

    var self = this;

    this.user = vmUser;

    this.username = '';
    this.password = '';

    this.btnLogin = function ( vm, event ) {

        $.when(
                STIBO.dataService.login( vm.username, vm.password )
            )
            .done(
                vm.loginSuccess
            )
            .fail(
                vm.loginError
            )
            .always();

    };

    this.btnLogout = function ( vm, event ) {

        $.when(
                STIBO.dataService.logout()
            )
            .done(
                vm.logoutSuccess
            )
            .fail(
                vm.logoutError
            )
            .always();

    };

    this.loginSuccess = function () {
        $.Topic( 'login.loggedIn' ).publish();
        self.clearInput();
    };

    this.loginError = function ( jqXHR, status, statusMessage ) {
        var message = jqXHR.responseJSON ? jqXHR.responseJSON.message : statusMessage;
        alert( 'Log ind fejlede. (' + message + ')' );
    };

    this.logoutSuccess = function () {
        $.Topic( 'login.loggedOut' ).publish();
    };

    this.logoutError = function ( data, status, jqXHR ) {
        alert( 'Log ud fejlede.' );
    };

    this.clearInput = function () {
        this.username = '';
        this.password = '';
    };

    // canSubmit property
    ko.defineProperty( this, 'canSubmit', function () {
        return !_.isEmpty( self.username );
        //return self.username && self.password;
    } );

    ko.track( this );
};