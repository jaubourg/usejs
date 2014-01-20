"use strict";

var fs = require( "fs" );

module.exports = {
	read: function( file ) {
		return fs.readFileSync( file ) + "";
	},
	write: function( file, content ) {
		fs.writeFileSync( file, content );
		console.log( file + " written" );
	},
	mkdir: function( dir ) {
		try {
			fs.mkdirSync( dir );
			console.log( dir + " created" );
		} catch ( e ) {}
	},
	dir: function( dir, filter ) {
		return fs.readdirSync( dir ).filter( function( name ) {
			return filter.test( name );
		} );
	}
};
