"use strict";




//
// TIMESHEET OVERVIEW 
//

/*

var myEmployee = new STIBO.models.Employee( 'cfi', 'Christian Fisker' );
var myLine = new STIBO.models.OverviewLine( myEmployee, [
    { id: '201410', status: 'closed' },
    { id: '201411', status: 'closed' },
    { id: '201412', status: 'closed' },
    { id: '201413', status: 'approved' },
    { id: '201414', status: 'submitted' },
    { id: '201415', status: 'open' },
    { id: '201416', status: 'open' },
    { id: '201417', status: 'open' }
] );
var myOverview = new STIBO.models.Overview();
myOverview.lines.push( myLine );
myOverview.lines.push( myLine );
myOverview.lines.push( myLine );
myOverview.lines.push( myLine );

STIBO.viewModels.TimesheetOverviewWeek = function () {
    var self = this;

    this.id = '';
    this.weekNo = 0;
    this.status = '';

    ko.track( this );
};

STIBO.viewModels.TimesheetOverviewLine = function () {
    //var self = this;

    this.id = 'CFI';
    this.name = 'Christian Fisker';
    this.weeks = [
        { id: '201410', number: 10, status: 'closed' },
        { id: '201411', number: 11, status: 'closed' },
        { id: '201412', number: 12, status: 'closed' },
        { id: '201413', number: 13, status: 'approved' },
        { id: '201414', number: 14, status: 'submitted' },
        { id: '201415', number: 15, status: 'open' },
        { id: '201416', number: 16, status: 'open' },
        { id: '201417', number: 17, status: 'open' }
    ];

    //ko.track( this );
};

STIBO.viewModels.TimesheetOverview = function () {

    this.lines = [];

    this.weeks = function () {
        //TODO: create dynamic list of weeks
        return [10, 11, 12, 13, 14, 15, 16, 17];
    };

    //ko.track( this );
};




var myTimesheetOverview = new STIBO.viewModels.TimesheetOverview();
myTimesheetOverview.lines.push( new STIBO.viewModels.TimesheetOverviewLine() );
myTimesheetOverview.lines.push( new STIBO.viewModels.TimesheetOverviewLine() );
myTimesheetOverview.lines.push( new STIBO.viewModels.TimesheetOverviewLine() );
myTimesheetOverview.lines.push( new STIBO.viewModels.TimesheetOverviewLine() );

ko.applyBindings( myTimesheetOverview, document.getElementById( 'TimesheetOverviewComponent' ) );


*/



