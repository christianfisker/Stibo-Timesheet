/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />
/// <reference path="stibo.weeksheet.viewModels.js" />
/// <reference path="Configuration.js" />
/// <reference path="stibo.weeksheet.models.js" />

"use strict";

//var STIBO = window.STIBO || {};
//STIBO.Timesheet = STIBO.Timesheet || {};

( function () {

    var user = null,
        login = null,
        timesheetOverview = null,
        timesheetDetail = null;

    var user = new STIBO.viewModels.UserViewModel();

    // Setup login component
    login = new STIBO.viewModels.LoginViewModel( user );
    ko.applyBindings( login, document.getElementById( 'LoginComponent' ) );

    // Setup timesheet overview component
    timesheetOverview = new STIBO.viewModels.TimesheetOverviewViewModel( user );
    ko.applyBindings( timesheetOverview, document.getElementById( 'TimesheetOverviewComponent' ) );

    // Setup timesheet detail component
    timesheetDetail = new STIBO.viewModels.TimesheetDetailViewModel( user );
    ko.applyBindings( timesheetDetail, document.getElementById( 'TimesheetDetailComponent' ) );

    timesheetOverview.setDetailViewModel( timesheetDetail );

    // TESTING
    //var timesheetDetails = new STIBO.viewModels.TimesheetDetails();
    //ko.applyBindings( timesheetDetails.viewModel, document.getElementById( 'TimesheetDetailsComponent' ) );

    var config = STIBO.dataService.getConfiguration();

} )();
