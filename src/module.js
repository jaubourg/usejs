function Module( add, remove ) {
	var object = {},
		locked = false;
	return {
		a: function( id, value ) {
			if ( locked ) {
				error( "expose after init" );
			}
			if ( id != undefined ) {
				if ( arguments.length === 1 ) {
					value = id;
					for ( id in value ) {
						object[ id ] = value[ id ];
						if ( add ) {
							add( id, value[ id ] );
						}
					}
				} else if ( arguments.length ) {
					object[ id ] = value;
					if ( add ) {
						add( id, value );
					}
				}
			}
		},
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
			locked = true;
		}
	};
}

var r_splitURL = /^(.*?)(#.*)?$/,
	modules = {},
	push = [].push;

function loadModule( url, sandBox, delayed ) {
	var future,
		hash = r_splitURL.exec( url );
	url = hash[ 1 ];
	hash = ( hash[ 2 ] || "#" ).substr( 1 );
	future = modules[ url ] || (( modules[ url ] = Future( function( future ) {
		var module = Module(),
			count = 1;
		function dec() {
			if ( !(( --count )) ) {
				module.l();
				future.s( module.v() );
			}
		}
		function inc( args ) {
			if ( count ) {
				count++;
				push.call( args, dec );
			}
		}
		sandBox( url, function( win, resolveURL ) {
			windows.push( win );
			var globals = global.v(),
				key;
			for ( key in globals ) {
				win[ key ] = globals[ key ];
			}
			win.require = requireFactory( resolveURL, inc );
			win.define = defineFactory( resolveURL, inc );
			win.expose = module.a;
			win.module = module.v;
		}, dec );
	}, delayed ) ));
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
