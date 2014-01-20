"use strict";

var fs = require( "./fs" );
var use = require( "./use" );

function extend( args ) {
	var obj = {};
	for ( var i = 0; i < args.length; i++ ) {
		for ( var key in args[ i ] ) {
			obj[ key ] = args[ i ][ key ];
		}
	}
	return obj;
}

module.exports = function( globalConfig, callback ) {
	use( "jshint@2.4.x", function( jshint ) {
		jshint = jshint.JSHINT;
		callback( function( path, file ) {
			var desc = file.code ? file : {
				code: fs.read( path + "/" + file ),
				fileForLine: function( line ) {
					return {
						file: path + "/" + file,
						line: line
					};
				}
			};
			var config = extend( [ globalConfig[ "*" ], globalConfig[ path ] ] );
			var passed = true;
			if ( !jshint( desc.code, config, config.globals ) ) {
				passed = false;
				jshint.errors.forEach( function ( error ) {
					if ( error ) {
						var tmp = desc.fileForLine( error.line );
						console.log( tmp.file + " [" + tmp.line + "] - " + error.code + " - " + error.reason +
							" - char " + error.character );
					}
				} );
			}
			return passed;
		} );
	} );
};