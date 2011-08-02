function scriptSandbox( resolveURL, filter ) {
	return function( url, init ) {
		loadScript( url, function() {
			functionSandbox( resolveURL, filter )( url, init );
		});
	};
}

function functionSandbox( resolveURL, filter ) {
	return function( _, init ) {
		var sandbox = {},
			done = init( sandbox, resolveURL );
		if ( filter ) {
			filter.call( sandbox, sandbox[ "use" ] );
		}
		done();
	};
}

var routes = {};

function resolveRoute( url ) {
	var tmp = url,
		hashes = [];
	do {
		tmp = r_splitURL.exec( tmp );
		url = tmp[ 1 ];
		if ( tmp[ 2 ] ) {
			hashes.push( tmp[ 2 ] );
		}
	} while(( tmp = routes[ url ] ));

	if ( hashes.length ) {
		hashes.reverse();
		url += "#" + hashes.join( "." );
	}
	return url;
}

function useFactory( resolveURL, future, returnCallback ) {
	function use() {
		var args = arguments,
			futures = [],
			index = args.length,
			callback = index && typeOf( args[ index - 1 ] ) === "function" && args[( --index )],
			count = index;
		return hold(function( release ) {
			function set( i ) {
				return function( value ) {
					futures[ i ] = value;
					if ( !(( --count )) ) {
						if ( callback ) {
							later( callback, futures );
						}
						later( release );
					}
				};
			}
			while( index-- ) {
				loadModule( resolveRoute( resolveURL( args[ index ] ) ), iframe ).g( set( index ) );
			}
		});
	}
	var module = Module( use ),
		hold,
		release,
		count = 0;
	extend( use, {
		"bridge": keyValueFunction( use, function( url, filter ) {
			if ( filter && typeOf( filter ) !== "function" ) {
				filter = undefined;
			}
			loadModule( resolveRoute( resolveURL( url ) ), scriptSandbox( resolveURL, filter ), true );
		}),
		"done": function( callback ) {
			future.g( callback );
			return use;
		},
		"expose": module.a,
		"globals": globalsRef,
		"hold": (( hold = function( action ) {
			count++;
			var done;
			action(function() {
				if ( !done ) {
					done = true;
					if ( !(( --count )) ) {
						module.l();
						future.s( module.v() );
					}
				}
			});
			return use;
		} )),
		"js": function() {
			var args = arguments,
				length = args.length,
				callback = length && typeOf( args[ length - 1 ] ) === "function" && args[( --length )];
			return hold(function( release ) {
				(function iterate( index ) {
					if ( index < length ) {
						loadScript( resolveRoute( resolveURL( args[ index ] ) ), function() {
							iterate( index + 1 );
						});
					} else {
						if ( callback ) {
							later( callback );
						}
						later( release );
					}
				})( 0 );
			});
		},
		"module": module.v,
		"resolve": resolveURL,
		"route": keyValueFunction( use, function( route, urlOrFunction ) {
			route = resolveURL( route );
			if ( typeOf( urlOrFunction ) === "function" ) {
				loadModule( route, functionSandbox( resolveURL, urlOrFunction ), true );
			} else {
				routes[ route ] = resolveURL( urlOrFunction );
			}
		}),
		"type": typeOf
	});
	hold(function( r ) {
		release = r;
	});
	return {
		u: use,
		r: release
	};
}
