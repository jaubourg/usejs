var fs = require( "fs" );

process.chdir( __dirname );

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
use( "uglify-js@2.4.x jshint@2.4.x", function( uglify, jshint ) {
	write( "dist/use.js", fullText );
	write( "dist/use.min.js", build( "build/template.min.js", config.version, uglify.minify( fullText, {
		fromString: true
	} ).code ) );
} );
