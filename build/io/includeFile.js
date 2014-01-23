( function( global ) {

	"use strict";

	var readFile;
	var resolvePath;

	var getPathResolverFor = ( function() {

		var getDir;

		if ( global.document ) {

			readFile = function( path ) {
				var xhr = new global.XMLHttpRequest();
				xhr.open( "GET", path, false );
				xhr.send();
				return xhr.responseText;
			}

			getDir = function( path ) {
				return path.replace( /\/[^\/]*$/g, "" );
			};

			var needsRefresh;
			var	div = global.document.createElement( "div" );
			div.appendChild( global.document.createElement( "a" ) );

			resolvePath = function( path ) {
				div.firstChild.href = path;
				if ( needsRefresh ) {
					// On older IEs, the whole div needs to be refreshed
					// (feature detected later in this very file)
					div.innerHTML = div.innerHTML;
				}
				return div.firstChild.href;
			};
			needsRefresh = ( resolvePath( "test" ) === "test" );

		} else {

			readFile = require( "./fs" ).read;

			var path = require( "path" );
			getDir = path.dirname;
			resolvePath = path.resolve;

		}

		var resolvers = {};

		return function( base ) {
			base = getDir( base );
			return resolvers[ base ] || ( resolvers[ base ] = function( path ) {
				return resolvePath( base + "/" + path );
			} );
		};

	} )();

	function stringSize( string ) {
		string = string.split( "\n" );
		var line = string.length - 1;
		return {
			col: string[ line ].length,
			line: line
		};
	}

	function appender( path, start ) {
		function add( string ) {
			add.content += string;
			var size = stringSize( add.content );
			var colDiff = size.line && start.col;
			return {
				path: path,
				colDiff: colDiff,
				lineDiff: start.line - 1,
				col: size.col + colDiff,
				line: size.line + start.line
			};
		}
		add.content = "";
		return add;
	}

	var R_CONFIG = /@([A-Z_]+)/g;

	function includeFile( config ) {

		config = config || {};

		function getFile( path, start ) {

			var included, filter, match;

			var pathResolver = getPathResolverFor( path );

			var content = ( readFile( path ) + "" ).replace( R_CONFIG, function( $0, $1 ) {
				return config[ $1.toLowerCase() ] || $0;
			} );

			start = start || {
				col: 0,
				line: 1
			};

			var output = appender( path, start );

			var positions = [];
			positions.push( output( "" ) );

			var previousIndex = 0;
			var R_INCLUDE = /\binclude\(\s*("[^"\n]+")\s*(?:,\s*("[^"\n]+")\s*)?\)\s*;/g;

			while ( ( match = R_INCLUDE.exec( content ) ) ) {
				included = getFile(
					pathResolver( JSON.parse( match[ 1 ] ) ),
					output( content.substr( previousIndex, match.index - previousIndex ) )
				);
				previousIndex = R_INCLUDE.lastIndex;
				if ( ( filter = match[ 2 ] && JSON.parse( match[ 2 ] ) ) ) {
					included = require( pathResolver( filter ) )( included );
				}
				positions.push.apply( positions, included.positions );
				var newPosition = output( included.content );
				var actualPosition = stringSize( content.substr( 0, previousIndex ) );
				//console.log( newPosition, actualPosition );
				newPosition.colDiff += newPosition.col - actualPosition.col;
				newPosition.lineDiff += newPosition.line - actualPosition.line - 1;
				positions.push( newPosition );
			}

			output( content.substr( previousIndex ) );

			return {
				path: path,
				content: output.content,
				positions: positions
			};
		}

		return function( file ) {
			return getFile( resolvePath( file ) );
		}

	}

	try {
		module.exports = includeFile;
	} catch ( e ) {}

	return includeFile;

} )( this );

