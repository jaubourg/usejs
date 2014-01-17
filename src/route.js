var routes = {};

function splitURL( url ) {
	// First splits into main path and hash
	url = r_splitURL.exec( url );
	// Then splits the path into segments (delimited by slashes)
	var tmp = url[ 1 ].split( "/" );
	// If the path ends with a slash, removes the last empty segment
	if ( !tmp[ tmp.length - 1 ] ) {
		tmp.pop();
	}
	return {
		u: tmp,
		h: url[ 2 ]
	};
}

function setRoute( route, urlOrFunction, resolveURL ) {
	// Splits the route and ignore the hash
	route = splitURL( resolveURL( route ) ).u;
	// Creates the routing structure
	// (it's a tree of plain objects where keys are segments)
	var index = 0;
	var length = route.length;
	var current = routes;
	for( ; index < length; index++ ) {
		current = current[ route[ index ] ] || ( ( current[ route[ index ] ] = {} ) );
	}
	// Is target a url or a function?
	if ( typeOf( urlOrFunction ) === "function" ) {
		// We have a function
		current[ "/" ] = urlOrFunction;
		// Keep track of how to resolve URLs
		current[ "/r" ] = resolveURL;
		// Let's prepare a map of already resolved routes
		current[ "/*" ] = {};
	} else {
		// Splits the target path
		urlOrFunction = splitURL( resolveURL( urlOrFunction ) );
		// Store the target path
		// (keys with slashes are safe because no path part can contain them)
		current[ "/" ] = urlOrFunction.u;
		current[ "/#" ] = urlOrFunction.h;
	}
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
		if ( current[ tmp ] ) {
			current = current[ tmp ];
		// If we have a catchall route
		} else if ( current[ "*" ] ) {
			// Stores the substitution value
			stars.push( tmp );
			// and goes further down
			current = current[ "*" ];
		} else {
			break;
		}
	}
	// If there actually is a route definition
	if ( ( tmp = current[ "/" ] ) ) {
		// Is target a url or a function?
		if ( typeOf( tmp ) === "function" ) {
			// Only full paths work here
			if ( index === length ) {
				url = url.join( "/" );
				// Load the module if not done already (handles stars)
				if ( !current[ "/*" ][ url ] ) {
					current[ "/*" ][ url ] = true;
					loadModule( url, functionSandbox( current[ "/r" ], function( use ) {
						tmp.apply( this, [ use ].concat( stars ) );
					} ), true );
				}
			}
		} else {
			// Replaces the portion we found (handles folders)
			data.u = url = tmp.concat( url.slice( index ) );
			// Applies substitutions
			for ( index = 0, length = tmp.length; index < length; index++ ) {
				url[ index ] = url[ index ].replace( r_star, function( _, $1, $2 ) {
					return "" + stars[ ( $1 || $2 ) - 1 ];
				} );
			}
			stars = undefined;
			// Stores the corresponding hash
			data.h = current[ "/#" ];
			// Attempts to resolve again (to handle recursive definitions)
			_resolveRoute( data, hashes );
		}
	}
}

function resolveRoute( url, resolveURL ) {
	url = splitURL( resolveURL( url ) );
	var hashes = [];
	_resolveRoute( url, hashes );
	url = url.u.join( "/" );
	// Handles the hash part (reverse order)
	if ( hashes.length ) {
		hashes.reverse();
		url += "#" + hashes.join( "." );
	}
	return url;
}
