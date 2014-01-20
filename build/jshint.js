"use strict";

var linterFactory = require( "./linterFactory" );
var use = require( "./use" );

module.exports = linterFactory( function( callback ) {
	use( "jshint@2.4.x", function( jshint ) {
		jshint = jshint.JSHINT;
		callback( function( code, config ) {
			return jshint( code, config, config.globals ) ? [] : jshint.errors;
		} );
	} );
} );
