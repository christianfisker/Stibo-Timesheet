/// <reference path="../libs/jquery.min.js" />
/// <reference path="../libs/knockout-3.1.0.js" />
/// <reference path="../libs/underscore-min.js" />

"use strict";

// Publisher/subscriber implementation (using jQuery) by Addy Osmani
// http://addyosmani.com/blog/jquery-1-7s-callbacks-feature-demystified/
jQuery.Topic = ( function () {
    var topics = {};
    return function ( id ) {
        var callbacks,
            topic = id && topics[id];
        if ( !topic ) {
            callbacks = jQuery.Callbacks();
            topic = {
                publish: callbacks.fire,
                subscribe: callbacks.add,
                unsubscribe: callbacks.remove
            };
            if ( id ) {
                topics[id] = topic;
            }
        }
        return topic;
    }
} )();


// Knockout binding handler for entering hours that must be rounded to nearest 0.25.
ko.bindingHandlers.hourValue = {
    init: function ( element, valueAccessor, allBindingsAccessor ) {
        var underlyingObservable = valueAccessor();
        var interceptor = ko.computed( {
            read: underlyingObservable,
            write: function ( newValue ) {

                // input is always a string.
                // replace ',' with '.' so that we can parse decimal numbers correctly.

                var current = underlyingObservable(),
                    // Replace comma with period, so that we can convert to a number afterwards. 
                    newValue = newValue.replace( ',', '.' ),
                    newValue = newValue === '' ? 0 : newValue, // Apparently "" fails the isNaN() check. Then parseFloat('' return NaN.
                    // Parse input to number.
                    valueToWrite = isNaN( newValue ) ? 0 : parseFloat( newValue );

                if ( valueToWrite <= 0 ) {
                    // Negative values not allowed.
                    valueToWrite = 0;
                }
                else {
                    // Round to nearest 0.25.
                    valueToWrite = ( Math.round( valueToWrite * 4 ) / 4 ).toFixed( 2 );
                    if ( parseFloat( valueToWrite ) <= 0 )
                        valueToWrite = 0;
                }

                //only write if it changed
                if ( valueToWrite !== current ) {
                    //console.log('new value')

                    if ( valueToWrite === 0 ) {
                        valueToWrite = '';
                        $( element ).val( '' ); // force blank through jQuery!?
                    }

                    underlyingObservable( valueToWrite );
                    //underlyingObservable.valueHasMutated();
                }
                else {
                    //console.log( 'same value' )
                    //if the rounded value is the same as it was, but a different value was written, force a notification so the current field is updated to the rounded value
                    if ( newValue !== current ) {
                        $( element ).val( current ); // Force update through jQuery.
                        underlyingObservable.valueHasMutated();
                    }
                }
            }
        } );
        ko.bindingHandlers.value.init( element, function () { return interceptor }, allBindingsAccessor );
    },
    update: ko.bindingHandlers.value.update
};


//ko.bindingHandlers.hourValue = {
//    init: function (element, valueAccessor){
//        ko.bindingHandlers.text.update( element, valueAccessor );
//    },
//    update: function ( element, valueAccessor ) {
//        ko.bindingHandlers.text.update( element, valueAccessor );
//    }
//};

//ko.bindingHandlers.hourValue_1 = {
//    update: function ( element, valueAccessor ) {
//        // Dette sender input værdien videre til 'value' bindingen på elementet. Det fungerer fint. Hvordan ændrer vi værdien?
//        ko.bindingHandlers.value.update( element, valueAccessor );
//        //ko.bindingHandlers.value.update( element, function () {
//        //    return valueAccessor;
//        //} );
//    }
//};

// Problemet er at selve valueAccessor objektet er ændret og nu fungerer bindingen slet ikke... Efterfølgende opdateringer slår ikke igennem!
//ko.bindingHandlers.hourValue_2 = {
//    update: function ( element, valueAccessor ) {
//        // Nu sender vi en anden værdi videre til 'value' bindingen på elementet. Det fungerer fint!
//        var output = 'Dette er output!';
//        var newValueAccessor = function () {
//            return output;
//        };
//        ko.bindingHandlers.value.update( element, newValueAccessor );
//    }
//};

// Samme problem som ovenfor!
//ko.bindingHandlers.hourValue_3 = {
//    update: function ( element, valueAccessor ) {
//        // Nu ændrer vi input værdien til noget andet og sender den videre til 'value' bindingen på elementet. Det fungerer fint!

//        var value = valueAccessor(); // returnerer en function som returnerer værdien!
//        var input = ko.unwrap( value ); // returnerer værdien!
//        var output = 0;

//        output = _.isString(input) ? input.replace( ',', '.' ) : input;
//        output = isNaN( output ) ? 0 : parseFloat( output );

//        if ( output < 0 ) {
//            // Negative values not allowed.
//            output = 0;
//        }
//        else {
//            // Round to nearest 0.25.
//            output = ( Math.round( output * 4 ) / 4 ).toFixed( 2 );
//        }

//        value( output );
//        $( element ).val( output );

//        //var newValueAccessor = function () {
//        //    return output;
//        //};
//        //ko.bindingHandlers.value.update( element, valueAccessor );
//    }
//};


//ko.bindingHandlers.simpleValue = {

//    init: function ( element, valueAccessor, allBindingsAccessor ) {

//        var underlyingObservable = valueAccessor();

//        var interceptor = ko.computed( {
//            read: underlyingObservable,
//            write: function ( newValue ) {
//                underlyingObservable( "Value" );
//                underlyingObservable.valueHasMutated();
//            }
//        } );

//        ko.bindingHandlers.value.init( element, function () { return interceptor }, allBindingsAccessor );
//    },
//    update: ko.bindingHandlers.value.update
//}

//ko.bindingHandlers.hourValue = {
//    init: function ( element, valueAccessor, allBindings, viewModel, bindingContext ) {
//        console.log( 'ko.binding.hourValue.init()' );
//        var value = valueAccessor();
//        var valueUnwrapped = ko.unwrap( value );

//        var output = '';
//        if ( value === 0 || value == '' ) {
//            output = '';
//        }
//        else {
//            output = value.toFixed( 2 );
//        }
//        $( element ).val( output );
//    },
//    update: function ( element, valueAccessor, allBindings, viewModel, bindingContext ) {
//        console.log( 'ko.binding.hourValue.update()' );
//        var value = valueAccessor();
//        var valueUnwrapped = ko.unwrap( value );

//        var output = '';
//        if ( value === 0 || value == '' ) {
//            output = '';
//        }
//        else {
//            output = value.toFixed( 2 );
//        }
//        $( element ).val( output );
//    }
//};