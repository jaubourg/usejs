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

	var paths = {
		0: {
			r: routes,
			s: []
		}
	};
	var nbPaths = 1;

	function addPath( route, stars, starSegment ) {
		if ( route ) {
			paths[ nbPaths++ ] = {
				r: route,
				s: starSegment ? stars.concat( [ starSegment ] ) : stars
			}
		}
		return !route;
	}

	var shorterPaths = [];

	var current, previousPaths, pathLength, urlLength, pathIndex, tmp, url;

	// Explores the route structure
	for( url = data.u, pathLength = 0, urlLength = url.length; nbPaths && pathLength < urlLength ; pathLength++ ) {
		tmp = url[ pathLength ];
		previousPaths = paths;
		paths = {};
		nbPaths = 0;
		for ( pathIndex in previousPaths ) {
			current = previousPaths[ pathIndex ];
			// If we have a subtree corresponding to the part, goes further down
			pathIndex = addPath( current.r.c[ tmp ], current.s );
			// If we have a catchall route
			pathIndex = addPath( current.r.c[ "*" ], current.s, tmp ) && pathIndex;
			// If nothing, keep track in the shorter paths
			if ( pathIndex === true && current.r.v ) {
				current.l = pathLength;
				shorterPaths.push( current );
			}
		}
	}
	current = undefined;
	for( pathIndex in paths ) {
		if ( paths[ pathIndex ].r.v ) {
			current = paths[ pathIndex ];
			break;
		}
	}
	if ( current ) {
		pathLength = urlLength;
	} else if ( shorterPaths.length ) {
		current = shorterPaths.pop();
		pathLength = current.l;
	}
	if ( current ) {
		var stars = current.s;
		current = current.r;
		// If there actually is a route definition
		if ( ( tmp = current.v ) ) {
			// Is this aliasing?
			if ( tmp.a ) {
				tmp = splitURL( tmp.r( tmp.a.apply( null, [ url.slice( 0, pathLength ).join( "" ) ].concat( stars ) ) ) );
				// Replaces the portion we found (handles folders)
				data.u = url = tmp.u.concat( url.slice( pathLength ) );
				// Applies substitutions
				for ( pathLength = 0, urlLength = tmp.u.length; pathLength < urlLength; pathLength++ ) {
					url[ pathLength ] = url[ pathLength ].replace( r_star, function( _, $1, $2 ) {
						return stars[ ( $1 || $2 ) - 1 ];
					} );
				}
				// Stores the corresponding hash
				data.h = tmp.h;
				// Attempts to resolve again (to handle recursive definitions)
				_resolveRoute( data, hashes );

			// Definitions only work with full paths
			} else if ( pathLength === urlLength ) {
				// Load the module if not done already
				if ( !modules[ ( url = url.join( "" ) ) ] ) {
					loadModule( url, functionSandbox( tmp.r, function( use ) {
						tmp.f.apply( this, [ use, url ].concat( stars ) );
					} ), true );
				}
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
