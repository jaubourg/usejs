"use strict";

var fs = require( "fs" );
var path = require( "path" );

var cache = require( "./../util/cache" )( {
	get: function( file ) {
		return fs.readFileSync( file ) + "";
	},
	set: function( file, content ) {
		fs.writeFileSync( file, content );
		return content;
	}
} );

module.exports = {
	read: function( file ) {
		return cache( path.resolve( file ) );
	},
	write: function( file, content ) {
		cache( path.resolve( file ), content );
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
