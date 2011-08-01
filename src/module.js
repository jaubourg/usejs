function Module( self, add, remove ) {
	var object = {},
		locked;
	return {
		a: keyValueFunction( self, function( id, value ) {
			if ( locked ) {
				error( "expose after init" );
			}
			object[ id ] = value;
			if ( add ) {
				add( id, value );
			}
		}),
		r: function( id ) {
			if ( locked ) {
				error( "remove after init" );
			}
			if ( id in object ) {
				delete object[ id ];
				if ( remove ) {
					remove( id );
				}
			}
			return self;
		},
		v: function( newObject ) {
			if ( newObject != undefined ) {
				if ( locked ) {
					error( "set after init" );
				}
				object = newObject;
			}
			return object;
		},
		l: function() {
			locked = 1;
		}
	};
}

var r_splitURL = /^(.*?)(?:#(.*))?$/,
	modules = {},
	push = [].push;

function loadModule( url, sandBox, delayed ) {
	var future,
		hash = r_splitURL.exec( url );
	url = hash[ 1 ];
	hash = hash[ 2 ];
	future = modules[ url ] ||
		(( modules[ url ] = Future( function( future ) {
				sandBox( url, function( win, resolveURL ) {
					windows.push( win );
					extend( win, globals.v() );
					var tmp = useFactory( resolveURL, future );
					win[ "use" ] = tmp.u;
					return tmp.r;
				});
			}, delayed )
		));
	if ( hash ) {
		hash = hash.split( "." );
		future = future.f(function( module ) {
			for ( var i = 0, length = hash.length; i < length; i++ ) {
				module = module[ hash[ i ] ];
			}
			return module;
		});
	}
	return future;
}
