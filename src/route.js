var routes = {
	c: {}
};

var r_route = /([^\/:]+|[\/:]+)/g;

function splitURL( url ) {
	// First splits into main path and hash
	url = r_splitURL.exec( url );
	// Then splits the path into segments (delimited by slashes)
	var tmp = url[ 1 ].match( r_route );
	// If the path ends with a slash, removes the last empty segment
	if ( tmp[ tmp.length - 1 ] === "/" ) {
		tmp.pop();
	}
	return {
		u: tmp,
		h: url[ 2 ]
	};
}

function setRoute( route, target, resolveURL, isDefine ) {
	// Splits the route and ignore the hash
	route = splitURL( resolveURL( route ) ).u;
	// Creates the routing structure
	// (it's a tree of plain objects where keys are segments)
	var index = 0;
	var length = route.length;
	var current = routes;
	var recursive;
	function forward( expr ) {
		current = current.c[ expr ] || ( ( current.c[ expr ] = {
			c: {}
		} ) );
	}
	for( ; index < length; index++ ) {
		if ( route[ index ] === "**" ) {
			forward( "*" );
			forward( "/" );
			recursive = current;
			forward( "*" );
			current.c[ "/" ] = recursive;
		} else {
			forward( route[ index ] );
		}
	}
	var targetIsAFunction = typeOf( target ) === "function";
	// Store the target path
	current.v = isDefine ? {
		// Create the factory function if we don't have it
		f: targetIsAFunction ? target : function( use ) {
			use.module( target );
		},
		// Keep track of how to resolve URLs
		r: resolveURL
	} : {
		// Create the aliasing function if we don't have one
		a: targetIsAFunction ? target : function() {
			return target;
		},
		// Keep track of how to resolve URLs
		r: resolveURL
	};
}

// This is outside of the _resolveRoute closure
// to save memory (and gain some speed in IE)
var r_star = /\$\(([0-9]+)\)|^\$([0-9]+)$/g;

// Recursively resolves routes
function _resolveRoute( data, hashes ) {
	// Stores the hash if present
	if ( data.h ) {
		hashes.push( data.h );
	}
	var stars;
	var url = data.u;
	var current = routes;
	var index = 0;
	var length = url.length;
	var tmp;
	stars = [];
	// Explores the route structure
	for( index = 0, length = url.length; index < length ; index++ ) {
		tmp = url[ index ];
		// If we have a subtree corresponding to the part, goes further down
		if ( current.c[ tmp ] ) {
			current = current.c[ tmp ];
		// If we have a catchall route
		} else if ( current.c[ "*" ] ) {
			// Stores the substitution value
			stars.push( tmp );
			// and goes further down
			current = current.c[ "*" ];
		} else {
			break;
		}
	}
	// If there actually is a route definition
	if ( ( tmp = current.v ) ) {
		// Is this aliasing?
		if ( tmp.a ) {
			tmp = splitURL( tmp.r( tmp.a.apply( null, [ url.slice( 0, index ).join( "" ) ].concat( stars ) ) ) );
			// Replaces the portion we found (handles folders)
			data.u = url = tmp.u.concat( url.slice( index ) );
			// Applies substitutions
			for ( index = 0, length = tmp.u.length; index < length; index++ ) {
				url[ index ] = url[ index ].replace( r_star, function( _, $1, $2 ) {
					return stars[ ( $1 || $2 ) - 1 ];
				} );
			}
			// Stores the corresponding hash
			data.h = tmp.h;
			// Attempts to resolve again (to handle recursive definitions)
			_resolveRoute( data, hashes );

		// Definitions only work with full paths
		} else if ( index === length ) {
			// Load the module if not done already
			if ( !modules[ ( url = url.join( "" ) ) ] ) {
				loadModule( url, functionSandbox( tmp.r, function( use ) {
					tmp.f.apply( this, [ use, url ].concat( stars ) );
				} ), true );
			}
		}
	}
}

function resolveRoute( url, resolveURL ) {
	url = splitURL( resolveURL( url ) );
	var hashes = [];
	_resolveRoute( url, hashes );
	url = url.u.join( "" );
	// Handles the hash part (reverse order)
	if ( hashes.length ) {
		hashes.reverse();
		url += "#" + hashes.join( "." );
	}
	return url;
}
