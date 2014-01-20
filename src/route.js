var routes = {
	c: {}
};

var R_ROUTE = /([^\/:]+|[\/:]+)/g;

function splitURL( url ) {
	// First splits into main path and hash
	url = R_SPLIT_URL.exec( url );
	// Then splits the path into segments (delimited by slashes)
	var tmp = url[ 1 ].match( R_ROUTE );
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
var R_STAR = /\$\(([0-9]+)\)|^\$([0-9]+)$/g;

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
				l: pathLength + 1,
				s: starSegment ? stars.concat( [ starSegment ] ) : stars
			};
		}
		return !route;
	}

	function fStar( _, $1, $2 ) {
		return stars[ ( $1 || $2 ) - 1 ];
	}

	var current, pathIndex, pathLength, previousPaths, segment, shorterPath, shorterPathForLength, stars, url,
		urlLength;

	// Explores the route structure
	for( url = data.u, pathLength = 0, urlLength = url.length; nbPaths && pathLength < urlLength ; pathLength++ ) {
		segment = url[ pathLength ];
		previousPaths = paths;
		paths = {};
		nbPaths = 0;
		shorterPathForLength = undefined;
		for ( pathIndex in previousPaths ) {
			current = previousPaths[ pathIndex ];
			// If we have a subtree corresponding to the part, goes further down
			pathIndex = addPath( current.r.c[ segment ], current.s );
			// If we have a catchall route
			pathIndex = addPath( current.r.c[ "*" ], current.s, segment ) && pathIndex;
			// If nothing, keep track in the shorter paths
			if ( pathIndex && current.r.v && !shorterPathForLength ) {
				shorterPathForLength = current;
			}
		}
		if ( shorterPathForLength ) {
			shorterPath = shorterPathForLength;
		}
	}
	current = undefined;
	for( pathIndex in paths ) {
		if ( paths[ pathIndex ].r.v && ( !current || current.s.length > paths[ pathIndex ].s.length ) ) {
			current = paths[ pathIndex ];
		}
	}
	if ( ( current = current || shorterPath ) ) {
		stars = current.s;
		pathLength = current.l;
		current = current.r;
		// If there actually is a route definition
		if ( ( current = current.v ) ) {
			// Is this aliasing?
			if ( current.a ) {
				current = splitURL( current.r( current.a.apply( null,
					[ url.slice( 0, pathLength ).join( "" ) ].concat( stars ) ) ) );
				// Replaces the portion we found (handles folders)
				data.u = url = current.u.concat( url.slice( pathLength ) );
				// Applies substitutions
				for ( pathLength = 0, urlLength = url.length; pathLength < urlLength; pathLength++ ) {
					url[ pathLength ] = url[ pathLength ].replace( R_STAR, fStar );
				}
				// Stores the corresponding hash
				data.h = current.h;
				// Attempts to resolve again (to handle recursive definitions)
				_resolveRoute( data, hashes );

			// Definitions only work with full paths
			} else if ( pathLength === urlLength ) {
				// Load the module if not done already
				if ( !modules[ ( url = url.join( "" ) ) ] ) {
					loadModule( url, functionSandbox( current.r, function( use ) {
						current.f.apply( this, [ use, url ].concat( stars ) );
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
