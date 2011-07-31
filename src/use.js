function scriptSandbox( resolveURL, filter ) {
	return function( url, init, done ) {
		loadScript( url, function() {
			functionSandbox( resolveURL, filter )( url, init, done );
		});
	};
}

function functionSandbox( resolveURL, filter ) {
	return function( _, init, done ) {
		var sandbox = {};
		init( sandbox, resolveURL );
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

function useFactory( resolveURL, before, after ) {
	function use() {
		if ( before ) {
			before();
		}
		var args = arguments,
			futures = [],
			index = args.length,
			callback = index && typeOf( args[ index - 1 ] ) === "function" && args[( --index )],
			count = index;
		function set( i ) {
			return function( value ) {
				futures[ i ] = value;
				if ( !(( --count )) ) {
					if ( callback ) {
						later( callback, futures );
					}
					if ( after ) {
						later( after );
					}
				}
			};
		}
		while( index-- ) {
			loadModule( resolveRoute( resolveURL( args[ index ] ) ), iframe ).g( set( index ) );
		}
	}
	extend( use, {
		"bridge": keyValueFunction( use, function( url, filter ) {
			if ( filter && typeOf( filter ) !== "function" ) {
				filter = undefined;
			}
			loadModule( resolveRoute( resolveURL( url ) ), scriptSandbox( resolveURL, filter ), true );
		}),
		"route": keyValueFunction( use, function( route, urlOrFunction ) {
			route = resolveURL( route );
			if ( typeOf( urlOrFunction ) === "function" ) {
				loadModule( route, functionSandbox( resolveURL, urlOrFunction ), true );
			} else {
				routes[ route ] = resolveURL( urlOrFunction );
			}
		}),
		"resolve": resolveURL,
		"type": typeOf,
		"globals": globalsRef
	});
	return use;
}
