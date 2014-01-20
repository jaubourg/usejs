"use strict";

process.chdir( __dirname );

var fs = require( "./build/fs" );
var parallel = require( "./build/parallel" );

var build = require( "./build/build" )( fs.read );

// Ensure the dist directory exists
fs.mkdir( "./dist/" );

// Get the config
var config = require( "./build/config.json" );

// Generate the full text script
var fullText = build( "./build/templates/full.js", config.version, config.modules, "src/%%.js" );

// Lint stuff
parallel( [ "jshint", "jscs" ].map( function( linterName ) {
	var passes = true;
	return function( callback ) {
		require( "./build/" + linterName )( config[ linterName ], function( linter ) {
			console.log( "\nLinting with " + linterName + "..." );
			config.lintDirectories.forEach( function( path ) {
				( path === "src" ? [ fullText ] : fs.dir( path, /\.js$/ ) ).forEach( function( file ) {
					passes = linter( path, file ) && passes;
				} );
			} );
			callback( passes );
		} );
	};
} ) )( function( passes ) {

	if ( !passes[ 0 ] || !passes[ 1 ] ) {
		console.log( "\nLINTING FAILED!" );
		return;
	}

	console.log( "\nGenerating files..." );

	fs.write( "./dist/use.js", fullText.code );

	require( "./build/minify" )( function( min ) {
		fs.write( "./dist/use.min.js", build( "./build/templates/min.js", config.version, min( fullText.code ) ).code );
	} );

} );
