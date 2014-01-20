"use strict";

var fs = require( "fs" );
var path = require( "path" );

var fileCache = {};

module.exports = {
	read: function( file ) {
		file = path.resolve( file );
		return fileCache[ file ] || ( fileCache[ file ] = fs.readFileSync( file ) + "" );
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
