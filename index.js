"use strict";

process.chdir( __dirname );

var fs = require( "./build/io/fs" );
var parallel = require( "./build/util/parallel" );

// Get the config
var now = new Date();
var config = require( "./build/config.json" );
config.date = now;
config.year = now.getFullYear();

var includeFile = require( "./build/io/includeFile" )( config );

// Ensure the dist directory exists
fs.mkdir( "./dist/" );

// Generate the full text script
var distDir = "./" + config.dist + "/";
var fullText = includeFile( "./build/dist/" + config.name +".js" );

// Lint stuff
parallel( [ "jshint", "jscs" ].map( function( linterName ) {
	var passes = true;
	return function( callback ) {
		require( "./build/lint/" + linterName )( config[ linterName ], function( linter ) {
			passes = linter( fullText ) && passes;
			/* console.log( "\nLinting with " + linterName + "..." );
			config.lintDirectories.forEach( function( path ) {
				( path === "src" ? [ fullText ] : fs.dir( path, /\.js$/ ) ).forEach( function( file ) {
					passes = linter( path, file ) && passes;
				} );
			} );*/
			callback( passes );
		} );
	};
} ) )( function( passes ) {

	if ( !passes[ 0 ] || !passes[ 1 ] ) {
		console.log( "\nLINTING FAILED!" );
		//return;
	}

	fs.write( distDir + config.name + ".js", fullText.content );

	require( "./build/util/use" )( "uglify-js@2.4.x", function() {
		fs.write( distDir + config.name + ".min.js", includeFile( "./build/dist/"  + config.name + ".min.js").content );
	} );

} );
