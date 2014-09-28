"use strict";

STIBO.testing = ( function ( repository ) {

    // Custom binding - nummeric values

    kendo.data.binders.numericValue = kendo.data.Binder.extend( {
        init: function ( element, bindings, options ) {
            console.log( 'numericValue.init' );
            //call the base constructor
            kendo.data.Binder.fn.init.call( this, element, bindings, options );

            var that = this;
            //listen for the change event of the element
            $( this.element ).on( "change", function ( event ) {
                return that.change( event ); //call the change function
            } );
        },
        refresh: function () {
            console.log( 'numericValue.refresh' );
            var that = this,
                value = this.bindings["numericValue"].get(); //get the value from the View-Model

            $( this.element ).val( value ); //update the HTML input element
        },
        change: function ( event ) {
            console.log( 'numericValue.change' );
            var value = this.element.value;
            //in this example the View-Model will be updated only if the value of the input is a number

            //if ( typeof value === 'string' ) {
            //    value = value.replace();
            //}
            //else if ( typeof value === 'number' ) {
            //    value = parseFloat( value );
            //}

            if ( !isNaN( value ) ) {
                this.bindings["numericValue"].set( value ); //update the View-Model
                return true;
            }
            else {
                this.element.value = this.bindings["numericValue"].get();
                return true;
                //event.stopPropagation();
                //event.preventDefault();
                //this.element.focus();
                //return false;
            }
        }
    } );


    // TEST

    var ModelTest = kendo.data.Model.define( {
        id: 'id',
        fields: {
            id: {},
            name: {},
            myNumber: { type: 'number', defaultValue: 10 }
        }

    } );

    //var test = new ModelTest( { name: 'christian' } );
    var test = new ModelTest();

    kendo.bind( $( '#testView' ), test );

    //var loginViewModel = kendo.observable( {
    //    isLoggedIn: false,
    //    username: '',
    //    password: '',
    //    name: 'Jens Jensen',
    //    submit: function (event) {
    //        event.preventDefault();

    //        $.ajax( {
    //            url: 'api/login',
    //            type: 'post',
    //            contentType: 'application/json; charset=utf-8',
    //            datatype: 'json',
    //            data: JSON.stringify( { username: this.username, password: this.password }),
    //            success: function ( data ) {
    //                alert( data );
    //            }

    //        } );

    //    },
    //    testsecure: function ( event ) {
    //        $.ajax( {
    //            url: 'api/secure',
    //            type: 'get',
    //            contentType: 'application/json; charset=utf-8',
    //            datatype: 'json',
    //            //data: JSON.stringify( { username: this.username, password: this.password } ),
    //            success: function ( data ) {
    //                alert( data );
    //            }

    //        } );

    //    },
    //    testunsecure: function ( event ) {
    //        $.ajax( {
    //            url: 'api/unsecure',
    //            type: 'get',
    //            contentType: 'application/json; charset=utf-8',
    //            datatype: 'json',
    //            //data: JSON.stringify( { username: this.username, password: this.password } ),
    //            success: function ( data ) {
    //                alert( data );
    //            }

    //        } );

    //    }
    //} );

    //kendo.bind( $('#LoginComponent'), loginViewModel );


    // TEST


    var ModelWeekSheetLine = kendo.data.Model.define( {
        id: 'id',
        fields: {
            id: { type: 'string' },
            sheetId: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string' },
            sunday: { type: 'number' },
            monday: { type: 'number' }
        },
        total: function () {
            return this.get( 'sunday' ) + this.get( 'monday' );
        }
    } );

    var ModelWeekSheet = kendo.data.Model.define( {
        id: 'id',
        fields: {
            id: {},
            userId: {},
            date: {},
            machine: {},
            shift: {},
            version: {},
            status: {}
        }
    } );


    var weekSheet = new ModelWeekSheet();
    weekSheet.id = 'ABC';
    weekSheet.userId = 'CFI';
    weekSheet.date = 'Somedate';
    weekSheet.machine = 'ROT';
    weekSheet.shift = 'Day38';
    weekSheet.version = '1';
    weekSheet.status = 'open';

    var weekSheetLines = [];

    var line1 = new ModelWeekSheetLine();
    line1.id = 'XYZ1';
    line1.sheetId = 'ABC';
    line1.userId = 'CFI';
    line1.type = 'normal';
    line1.sunday = 2;
    line1.monday = 4;
    weekSheetLines.push( line1 );

    var line2 = new ModelWeekSheetLine();
    line2.id = 'XYZ2';
    line2.sheetId = 'ABC';
    line2.userId = 'CFI';
    line2.type = 'overtime';
    line2.sunday = 0;
    line2.monday = 1;
    weekSheetLines.push( line2 );

    var myViewModel = kendo.observable( {
        header: weekSheet,
        lines: weekSheetLines,
        approve: function () {
            alert( 'The sheet has been approved!' );
        },
        total: function () {
            return this.lines[0].total() + this.lines[1].total();
        }
    } );

    kendo.bind( $( '#myViewModel' ), myViewModel );



    // TEST

    var viewModel = kendo.observable( {
        header: null,
        sunday: 13,
        line1: {
            monday: 10,
            tuesday: 3
        },
        line2: {
            monday: 1,
            tuesday: 4
        },
        lines: [
            {
                type: 1,
                sunday: 1,
                monday: 2,
                tuesday: 4,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0
            },
            {
                type: 2,
                sunday: 0,
                monday: 8,
                tuesday: 1,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0
            }
        ],
        check: function () {
            alert( 'The current value is = ' + viewModel.lines[0].tuesday );
        },
        total: function ( index ) {
            var line = this.get( 'lines[ ' + index + ']' );
            //var line = this.lines[index];
            return parseFloat( line.get( 'sunday' ) ) +
                parseFloat( line.get( 'monday' ) ) +
                parseFloat( line.get( 'tuesday' ) ) +
                parseFloat( line.get( 'wednesday' ) ) +
                parseFloat( line.get( 'thursday' ) ) +
                parseFloat( line.get( 'friday' ) ) +
                parseFloat( line.get( 'saturday' ) );
        }

    } );

    kendo.bind( $( '#detailsWeekSheet' ), viewModel );

    /*
        $( '#detailsWeekSheet' )
            .on( 'change', 'INPUT', function ( event ) {
                console.log( 'change' );
    
                var input = $( this );
    
                // validate
    
                event.preventDefault();
                return false;
    
            } )
            .on( 'blur', 'INPUT', function ( event ) {
                console.log( 'blur' );
                event.preventDefault();
                return false;
            } )
        .on( 'keypress', 'INPUT', function ( event ) {
            console.log( 'keypress (' + event.charCode + ')' );
            event.preventDefault();
            return false;
        } );
    */

} )( STIBO.dataSource );