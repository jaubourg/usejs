function useFactory( resolveURL, future ) {
	function loaderFactory( load ) {
		function main( urls, callback ) {
			var values = [];
			var index = urls.length || 0;
			var count = index + 1;
			function done() {
				if ( !( ( --count ) ) ) {
					callback( values );
				}
			}
			function set( i ) {
				return function( value ) {
					values[ i ] = value;
					done();
				};
			}
			while( index-- ) {
				if ( typeof( urls[ index ] ) === "object" ) {
					main( urls[ index ], set( index ) )
				} else {
					load( resolveRoute( urls[ index ], resolveURL ), set( index ) );
				}
			}
			done();
		}
		return function() {
			var urls = arguments;
			var length = urls.length;
			var callback = length && typeOf( urls[ length - 1 ] ) === "function" && urls[ ( --length ) ];
			urls = [].slice.call( urls, 0, length )
			return hold( function( release ) {
				main( urls, function( values ) {
					if ( callback ) {
						later( callback, values );
					}
					later( release );
				} );
			} );
		}
	}
	var use = loaderFactory( function( url, callback ) {
		return loadModule( url, iframeSandbox ).g( callback );
	} );
	var module = Module( use );
	var hold;
	var release;
	var count = 0;
	function routeFactory( isDefine ) {
		return keyValueFunction( use, function( route, urlOrFunction ) {
			setRoute( route, urlOrFunction, resolveURL, isDefine );
		} );
	}
	var text = function( url, callback ) {
		loadText( resolveURL( url ), callback );
	};
	extend( use, {
		"bridge": keyValueFunction( use, function( url, filter ) {
			if ( filter && typeOf( filter ) !== "function" ) {
				filter = undefined;
			}
			loadModule( resolveRoute( url, resolveURL ), scriptSandbox( resolveURL, filter ), true );
		} ),
		"done": function( callback ) {
			future.g( callback );
			return use;
		},
		"expose": module.a,
		"hold": ( ( hold = function( action ) {
			count++;
			var done;
			action(function() {
				if ( !done ) {
					done = true;
					if ( !( ( --count ) ) ) {
						module.l();
						future.s( module.v() );
					}
				}
			} );
			return use;
		} ) ),
		"json": loaderFactory( function( url, callback ) {
			loadText( url, function( text ) {
				callback( new Function( "return " + text + ";" )() );
			} );
		} ),
		"module": module.v,
		"resolve": resolveURL,
		"route": routeFactory( 0 ),
		"script": loaderFactory( loadScript ),
		"text": loaderFactory( loadText ),
		"type": typeOf
	} );
	use.route.define = routeFactory( 1 );
	hold( function( r ) {
		release = r;
	} );
	return {
		u: use,
		r: release
	};
}
