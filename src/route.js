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

function setRoute( route, url ) {
	// Splits the route and ignore the hash
	route = splitURL( route ).u;
	// Splits the target path
	url = splitURL( url );
	// Creates the routing structure
	// (it's a tree of plain objects where keys are segments)
	var index = 0,
		length = route.length,
		current = routes;
	for( ; index < length; index++ ) {
		current = current[ route[ index ] ] || ( ( current[ route[ index ] ] = {} ) );
	}
	// Store the target path
	// (keys with slashes are safe because no path part can contain them)
	current[ "/" ] = url.u;
	current[ "/#" ] = url.h;
}

// This is outside of the _resolveRoute closure
// to save memory (and gain some speed in IE)
var r_star = /\$\(([0-9]+)\)|^\$([0-9]+)$/g,
	stars;
function fStars( _, $1, $2 ) {
	return "" + stars[ ( $1 || $2 ) - 1 ];
}

// Recursively resolves routes
function _resolveRoute( data, hashes ) {
	// Stores the hash if present
	if ( data.h ) {
		hashes.push( data.h );
	}
	var url = data.u,
		current = routes,
		index = 0,
		length = url.length,
		tmp;
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
		// Replaces the portion we found (handles folders)
		data.u = url = tmp.concat( url.slice( index ) );
		// Applies substitutions
		for ( index = 0, length = tmp.length; index < length; index++ ) {
			url[ index ] = url[ index ].replace( r_star, fStars );
		}
		stars = undefined;
		// Stores the corresponding hash
		data.h = current[ "/#" ];
		// Attempts to resolve again (to handle recursive definitions)
		_resolveRoute( data, hashes );
	}
}

function resolveRoute( url ) {
	url = splitURL( url );
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
