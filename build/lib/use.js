"use strict";

module.exports = function( names, callback ) {
	names = names.split( " " );
	function done() {
		callback.apply( null, names.map( function( name ) {
			return require( name.split( "@" )[ 0 ] );
		} ) );
	}
	try {
		return done();
	} catch ( e ) {}
	console.log( "Installing " + names.join( " & " ) + "..." );
	require( "child_process" ).exec( "npm install " + names.join( " " ), function( error ) {
		if ( error ) {
			throw error;
		}
		done();
	} );
};
