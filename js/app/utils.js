'use strict';

var STIBO = window.STIBO || {};

STIBO.utils = STIBO.utils || {};

// Find an object in an array by comparing a specified field with a value. Returns null if not found.
STIBO.utils.find = function ( arCollection, sField, aValue ) {
    var result = _.find(
        arCollection,
        function ( element ) {
            return element[sField] === aValue;
        }
    );

    return typeof result === 'undefined' ? null : result;
}

// Return null (or defaultvalue) if the value is undefined. Else returns the value.
STIBO.utils.default = function ( value, defaultValue ) {
    return _.isUndefined( value ) ?
        ( _.isUndefined( defaultValue ) ? null : defaultValue ) :
        value;
};

// Takes output from a parseFloat() function  and checks/converts...
STIBO.utils.toNumber = function ( value, decimals, round ) {

    if ( _.isNaN || !_.isNumber( value ) )
        return 0.00;

    return value.toFixed( 2 );
};

STIBO.utils.numberToHours = function ( number, showZero ) {
    var hours = isNaN( number ) ? 0 : parseFloat( number );
    if ( hours === 0 && showZero !== true )
        return '';
    return hours.toFixed( 2 );
};

STIBO.utils.hoursToNumber = function ( hours ) {
    var output = parseFloat( hours );
    output = isNaN( output ) ? 0 : output;
    return output;
};