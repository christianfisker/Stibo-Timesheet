"use strict";

var STIBO = window.STIBO || {};

STIBO.dataService = ( function ( config ) {

    //# Private functions

    function get( url, async ) {
        return $.ajax( {
            url: config.baseUrl + url,
            type: 'get',
            async: async === false ? false : true,
            dataType: 'json',
        } );
    }

    function post( url, data, async ) {
        var data = JSON.stringify( data );
        return $.ajax( {
            url: config.baseUrl + url,
            type: 'post',
            async: async === false ? false : true,
            data: data,
            contentType: 'application/json; charset=utf-8'//,
            //dataType: 'json'
        } );
    }

    //# Public functions

    return {
        getConfiguration: function () { return get( 'config', false ); }, // getConfiguration,
        login: function ( username, password ) { return post( 'login', { username: username, password: password }, false ); },//login,
        logout: function () { return get( 'logout', false ); }, // logout,
        getCurrentUser: function () { return get( 'user', false ); }, // getCurrentUser,
        getTimesheetOverview: function () { return get( 'timesheetoverview', false ); }, //getTimesheetOverview,
        getEmployee: function ( id ) { return get( 'employee/' + id, false ); }, //getEmployee,
        getTimesheet: function ( id ) { return get( 'timesheet/' + id, false ); }, //getTimesheet,
        saveTimesheet: function ( data ) { return post( 'timesheet', data ); }// saveTimesheet
    };

} )( { baseUrl: 'service/' } );

//function getConfiguration() {
//    return $.getJSON( config.baseUrl + 'config' );
//}

//function login( username, password ) {
//    // post username and password
//    // return statuscode 200 if login successful
//    // no other data is returned
//    var data = JSON.stringify( { username: username, password: password } );
//    return $.ajax( {
//        url: config.baseUrl + 'login',
//        type: 'post',
//        contentType: 'application/json; charset=utf-8',
//        data: data
//    } );
//}

//function logout() {
//    // cannot be replaced by getJSON because no JSON is actually returned on success.
//    return $.ajax( {
//        url: config.baseUrl + 'logout',
//        type: 'get',
//        contentType: 'application/json; charset=utf-8'
//    } );
//}

//function getCurrentUser() {
//    return $.getJSON( config.baseUrl + 'user' );
//}

//function getTimesheetOverview() {
//    return $.getJSON( config.baseUrl + 'timesheetoverview' );
//}

//function getEmployee( employeeId ) {
//    return get( 'employee/' + employeeId, false );
//    //return $.ajax( {
//    //    url: config.baseUrl + 'employee/' + employeeId,
//    //    type: 'get',
//    //    async: false,
//    //    dataType: 'json',
//    //} );

//    //return $.getJSON( config.baseUrl + 'employee/' + employeeId );
//}

//function getTimesheet( id, version ) {
//    return get( 'timesheet/' + id, false );
//    //return $.getJSON( config.baseUrl + 'timesheet/' + id );
//}

//function saveTimesheet( data ) {
//    return post( 'timesheet', data );
//}

