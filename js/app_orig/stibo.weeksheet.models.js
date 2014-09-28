"use strict";

var STIBO = window.STIBO || {};
STIBO.models = STIBO.models || {};


STIBO.models.Employee = function ( id, name ) {
    this.id = id || '';
    this.name = name || '';
};

STIBO.models.Week = function ( id, status ) {
    this.id = id || '';
    this.status = status || '';
};

STIBO.models.OverviewLine = function ( employee, weeks ) {
    this.employee = employee || null;
    this.weeks = weeks || [];
};

STIBO.models.Overview = function ( startWeek, lines ) {
    this.startWeek = startWeek || 1;
    this.lines = lines || [];
};
