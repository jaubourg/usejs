// Build file for usejs
var fs = require( "fs" );
var path = require( "path" );

process.chdir( __dirname );

function read( file ) {
	console.log( "Reading " + file + "..." );
	return fs.readFileSync( file ) + ""
}

function write( file, content ) {
	fs.writeFileSync( file, content );
	console.log( file + " done!" );
}

function template( file, data ) {
	return read( file ).replace( /@([A-Z]+)/g, function( _, key ) {
		return data[ key ];
	} );
}

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
var fullText = template( "build/template.js", {
	VERSION: config.version,
	DATE: ( new Date() ).toString(),
	CODE: Object.keys( config.modules ).map( function( name ) {
		return read( "src/" + name + ".js" );
	} ).join( "\n" )
} );

// Let's install some packages
console.log( "Installing packages..." );
require( "child_process" ).exec( "npm install uglify-js@2.4.9 jshint@2.4.1", function( error ) {
	if ( error ) {
		throw error;
	}
	var minified = template( "build/template.min.js", {
		VERSION: config.version,
		CODE: require( "uglify-js" ).minify( fullText, {
			fromString: true
		} ).code
	} );
	write( "dist/use.js", fullText );
	write( "dist/use.min.js", minified );
} );
