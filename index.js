"use strict";

process.chdir( __dirname );

var fs = require( "./build/lib/fs" );
var use = require( "./build/lib/use" );

var build = require( "./build/build" )( fs.read );

// Ensure the dist directory exists
fs.mkdir( "./dist/" );

// Get the config
var config = require( "./build/config.json" );

// Generate the full text script
var fullText = build( "./build/templates/full.js", config.version, config.modules, "src/%%.js" );

// Lint stuff
( function doLint( linters, callback, hasErrors ) {

	var linterName = linters.pop();

	if ( !linterName ) {
		return !hasErrors && callback();
	}

	console.log( "\nLinting with " + linterName );

	require( "./build/lib/" + linterName )( config[ linterName ], function( linter ) {

		config.lintDirectories.forEach( function( path ) {
			( path === "src" ? [ fullText ] : fs.dir( path, /\.js$/ ) ).forEach( function( file ) {
				hasErrors = !linter( path, file ) || hasErrors;
			} );
		} );
		doLint( linters, callback, hasErrors );
	} );

} )( [ "jshint", "jscs" ], function() {

	fs.write( "./dist/use.js", fullText.code );

	use( "uglify-js@2.4.x", function( uglify ) {
		fs.write( "./dist/use.min.js", build( "./build/templates/min.js", config.version, uglify.minify( fullText.code, {
			fromString: true
		} ).code ) );
	} );

} );
