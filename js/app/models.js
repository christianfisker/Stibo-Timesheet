"use strict";

STIBO.timesheet = STIBO.timesheet || {};
STIBO.timesheet.models = {};

STIBO.timesheet.models.Timesheet = function ( employeeId, location, week ) {
    this.id = null;
    this.employeeId = employeeId;
    this.location = location;
    this.week = week;
    this.state = 'BLANK';
    this.machine = null;
    this.shift = null;
    this.comment = null;
    this.hasLeadPressSupplement = false;
    this.lines = null;
};

STIBO.timesheet.models.TimesheetLine = function ( type ) {
    this.type = type;
    this.sunday = 0;
    this.monday = 0;
    this.tuesday = 0;
    this.wednesday = 0;
    this.thursday = 0;
    this.friday = 0;
    this.saturday = 0;
};