"use strict";

var extend = require ( "./../util/extend" );
var includeFile = require( "./../io/includeFile" )();
var path = require( "path" );

module.exports = function( createLinter ) {
	return function( globalConfig, callback ) {
		createLinter( function( linter ) {
			callback( function( desc ) {
				desc = typeof desc === "string" ? includeFile( desc ) : desc;
				var config = extend( [ globalConfig[ "*" ], globalConfig[ path.dirname( desc.path ) ] ] );
				var errors = linter( desc.content, config );
				var positions = desc.positions;
				var pos = 1;
				errors.forEach( function( error ) {
					var line = error.line || 0;
					var col = error.column || error.character || 0;
					var curPos;
					for ( ; pos < positions.length && ( curPos = positions[ pos ] ) &&
						curPos.line <= line && ( curPos.line < line || curPos.col < col ); pos++ ) {
					}
					curPos = positions[ pos - 1 ];
					if ( line === curPos.line ) {
						col -= curPos.colDiff;
					}
					line -= curPos.lineDiff;
					var log = [ curPos.path + " [" + line + "]" ];
					if ( "code" in error ) {
						log.push( error.code );
					}
					log.push( error.reason || error.message, "col " + col );
					console.log( log.join( " - " ) );
				} );
				return !errors.length;
			} );
		} );
	};
};
