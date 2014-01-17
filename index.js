var exec = require( "child_process" ).exec;
var fs = require( "fs" );

process.chdir( __dirname );

// Let's install what's needed for testing
exec( "bower install qunit#1.13.0", function( error ) {
	if ( error ) {
		console.error( "You need to install bower in order to unit test!" );
	}
	console.log( "qunit is installed" );
} );

// Utilities
function read( file ) {
	console.log( "Reading " + file + "..." );
	return fs.readFileSync( file ) + ""
}

function write( file, content ) {
	fs.writeFileSync( file, content );
	console.log( file + " done!" );
}

function use( names, callback ) {
	names = names.split( " " );
	function done() {
		callback.apply( null, names.map( function( name ) {
			console.log( name.split( "@" )[ 0 ] );
			return require( name.split( "@" )[ 0 ] );
		} ) );
	}
	try {
		return done();
	} catch ( e ) {}
	console.log( "Installing " + names.join( " & " ) + "..." );
	exec( "npm install " + names.join( " " ), function( error ) {
		if ( error ) {
			throw error;
		}
		done();
	} );
}

var build = require( "./build/build" )( read );

// Ensure the dist directory exists
try {
	fs.rmdirSync( "dist" );
} catch( _ ) {}

try {
	fs.mkdirSync( "dist" );
} catch( _ ) {}

// Get the config
var config = JSON.parse( read( "build/config.json" ) );

// Generate the full text script
var fullText = build( "build/template.js", config.version, config.modules, "src/%%.js" );

// Let's install some packages
use( "uglify-js@2.4.9 jshint@2.4.1", function( uglify, jshint ) {
	write( "dist/use.js", fullText );
	write( "dist/use.min.js", build( "build/template.min.js", config.version, uglify.minify( fullText, {
		fromString: true
	} ).code ) );
} );
