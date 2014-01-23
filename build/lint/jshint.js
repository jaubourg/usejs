"use strict";

var factory = require( "./factory" );
var use = require( "./../util/use" );

module.exports = factory( function( callback ) {
	use( "jshint@2.4.x", function( jshint ) {
		jshint = jshint.JSHINT;
		callback( function( code, config ) {
			return jshint( code, config, config.globals ) ? [] : jshint.errors;
		} );
	} );
} );
