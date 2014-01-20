"use strict";

process.chdir( __dirname );

var fs = require( "./build/lib/fs" );
var use = require( "./build/lib/use" );

var build = require( "./build/build" )( fs.read );

// Ensure the dist directory exists
fs.mkdir( "./dist/" );

// Get the config
var config = JSON.parse( fs.read( "build/config.json" ) );

// Generate the full text script
var fullText = build( "build/templates/full.js", config.version, config.modules, "src/%%.js" );

// jsHint
require( "./build/lib/jshint" )( config.jshint, function( jshint ) {

	var passed = true;

	Object.keys( config.jshint ).forEach( function( path ) {
		if ( path !== "*" ) {
			( path === "src" ? [ fullText ] : fs.dir( path, /\.js$/ ) ).forEach( function( file ) {
				passed = jshint( path, file ) && passed;
			} );
		}
	} );

	if ( passed ) {

		fs.write( "dist/use.js", fullText.code );

		use( "uglify-js@2.4.x", function( uglify ) {
			fs.write( "dist/use.min.js", build( "build/templates/min.js", config.version,
				uglify.minify( fullText.code, {
					fromString: true
				} ).code )
			);
		} );

	}

} );
