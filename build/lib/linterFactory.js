"use strict";

var extend = require ( "./extend" );
var fs = require( "./fs" );

module.exports = function( createLinter ) {
	return function( globalConfig, callback ) {
		createLinter( function( linter ) {
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
				var errors = linter( desc.code, config );
				errors.forEach( function( error ) {
					var tmp = desc.fileForLine( error.line );
					var log = [ tmp.file + " [" + tmp.line + "]" ];
					if ( "code" in error ) {
						log.push( error.code );
					}
					log.push( error.reason || error.message, "char " + ( error.character || error.column ) );
					console.log( log.join( " - " ) );
				} );
				return !errors.length;
			} );
		} );
	};
}
