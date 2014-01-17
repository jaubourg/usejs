// Module constructor
// A module is a collection of exposed property (or any non-null non-undefined value).
// It can be locked at some point in which case the value cannot be changed through
// the Module instance interface (you can still go dirty on the underlying object).
// self is the context of the methods (enables chaining).
// add and remove are callbacks that can be specified to take specific actions when
// fields are added or removed from the Module (used by the globals repository).
function Module( self, add, remove ) {
	var object = {},
		locked;
	return {
		// Adds one or several fields to the module
		// throws an exception if module is locked
		a: keyValueFunction( self, function( id, value ) {
			if ( locked ) {
				error( "expose after init" );
			}
			object[ id ] = value;
			if ( add ) {
				add( id, value );
			}
		} ),
		// Remove a field from the module
		// throws an exception if module is locked
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
		// Get the module, will set it if newObject is given
		// and is non-null and non-undefined: in that case
		// throws an exception if module is locked
		v: function( newObject ) {
			if ( newObject != undefined ) {
				if ( locked ) {
					error( "set after init" );
				}
				object = newObject;
			}
			return object;
		},
		// Locks the module (you cannot unlock a module)
		l: function() {
			locked = 1;
		}
	};
}

var r_splitURL = /^(.*?)(?:#(.*))?$/,
	modules = {},
	push = [].push;

// Loads a module using the specified sandbox system (iframe, function, ...).
// Caching is handled using Futures. If delayed is true, then the Future will
// be "on demand" and no action will be immediately taken.
function loadModule( url, sandBox, delayed ) {
	var future;
	var hash = r_splitURL.exec( url );
	url = hash[ 1 ];
	hash = hash[ 2 ];
	future = modules[ url ] ||
		( ( modules[ url ] = Future( function( future ) {
				sandBox( url, function( win, resolveURL ) {
					windows.push( win );
					extend( win, globals.v() );
					var tmp = useFactory( resolveURL, future );
					win[ "use" ] = tmp.u;
					return tmp.r;
				} );
			}, delayed )
		) );
	if ( hash ) {
		hash = hash.split( "." );
		future = future.f( function( module ) {
			for ( var i = 0, length = hash.length; i < length; i++ ) {
				module = module[ hash[ i ] ];
			}
			return module;
		} );
	}
	return future;
}
