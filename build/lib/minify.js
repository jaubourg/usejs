"use strict";

var use = require( "./use" );

module.exports = function( callback ) {
	use( "uglify-js@2.4.x", function( uglify ) {
		callback( function( code ) {
			return uglify.minify( code, {
				fromString: true
			} ).code;
		} );
	} );
};
