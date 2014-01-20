"use strict";

module( "type" );

asyncTest( "type", 17, function() {
	strictEqual( use.type( null ), "null", "null" );
	strictEqual( use.type( undefined ), "undefined", "undefined" );
	strictEqual( use.type( true ), "boolean", "Boolean" );
	strictEqual( use.type( false ), "boolean", "Boolean" );
	strictEqual( use.type( Boolean( true ) ), "boolean", "Boolean" );
	strictEqual( use.type( 0 ), "number", "Number" );
	strictEqual( use.type( 1 ), "number", "Number" );
	strictEqual( use.type( Number( 1 ) ), "number", "Number" );
	strictEqual( use.type( "" ), "string", "String" );
	strictEqual( use.type( "a" ), "string", "String" );
	strictEqual( use.type( String( "a" ) ), "string", "String" );
	strictEqual( use.type( {} ), "object", "Object" );
	strictEqual( use.type( /foo/ ), "regexp", "RegExp" );
	strictEqual( use.type( new RegExp( "asdf" ) ), "regexp", "RegExp" );
	strictEqual( use.type( [ 1 ] ), "array", "Array" );
	strictEqual( use.type( new Date() ), "date", "Date" );
	strictEqual( use.type( function() { return; } ), "function", "Function" );
	start();
} );
