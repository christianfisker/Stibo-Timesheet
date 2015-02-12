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

    function post( url, data, async, forcejson ) {
        var data = JSON.stringify( data ),
            options = {
                url: config.baseUrl + url,
                type: 'post',
                async: async === false ? false : true,
                data: data,
                contentType: 'application/json; charset=utf-8'
            };

        if ( forcejson === true )
            options.dataType = 'json';

        return $.ajax( options );
    }

    //# Public functions

    return {
        getConfiguration: function () { return get( 'config', false ); }, // getConfiguration,
        login: function ( username, password ) { return post( 'login', { username: username, password: password, companyCode: config.companyCode } ); },
        logout: function () { return get( 'logout', false ); }, // logout,
        getCurrentUser: function () { return get( 'user' ); },
        getTimesheetOverview: function () { return get( 'timesheetoverview' ); },
        getEmployee: function ( id ) { return get( 'employee/' + id, false ); }, //getEmployee,
        getTimesheet: function ( id ) { return get( 'timesheet/' + id, false ); }, //getTimesheet,
        getTimesheetVersion: function ( employeeId, weekNum, role ) { return get( 'timesheetversion/' + employeeId + '/' + weekNum + '/' + role, false ); },
        saveTimesheet: function ( data ) { return post( 'timesheet', data, false, true ); }// saveTimesheet
    };

} )( { baseUrl: 'service/', companyCode: STIBO.Timesheet.Configuration.companyCode } );
