"use strict";

var factory = require( "./factory" );
var use = require( "./../util/use" );

module.exports = factory( function( callback ) {
	use( "jscs|node_modules/jscs/lib/string-checker@1.2.x", function( JSCS ) {
		callback( function( code, config ) {
			var jscs = new JSCS();
			jscs.registerDefaultRules();
			jscs.configure( config );
			return jscs.checkString( code )._errorList.sort( function( a, b ) {
				return ( a.line - b.line ) || ( a.column - b.column );
			} );
		} );
	} );
} );
