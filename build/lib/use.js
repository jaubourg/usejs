"use strict";

module.exports = function( modules, callback ) {
	modules = modules.split( " " ).map( function( string ) {
		string = string.split( "@" );
		string[ 0 ] = string[ 0 ].split( "|" );
		return {
			name: string[ 0 ][ 0 ],
			version: string[ 1 ],
			requireName: string[ 0 ][ 1 ] && ( process.cwd() + "/" +  string[ 0 ][ 1 ] ) || string[ 0 ][ 0 ]
		};
	} );
	function done() {
		callback.apply( null, modules.map( function( module ) {
			return require( module.requireName );
		} ) );
	}
	try {
		done();
	} catch ( e ) {
		var names = modules.map( function( module ) {
			return module.name + "@" + module.version;
		} );
		console.log( "Installing " + names.join( " & " ) + "..." );
		require( "child_process" ).exec( "npm install " + names.join( " " ), function( error ) {
			if ( error ) {
				throw error;
			}
			done();
		} );
	}
};
