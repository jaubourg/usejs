var windows = [ window ],
	global = Module( function( id, value ) {
		for ( var i = 0, length = windows.length; i < length; i++ ) {
			windows[ i ][ id ] = value;
		}
	}, function( id ) {
		for ( var i = 0, length = windows.length; i < length; i++ ) {
			try {
				windows[ i ][ id ] = undefined;
				delete windows[ i ][ id ];
			} catch( e ) {}
		}
	});

global.a({
	globals: {
		add: global.a,
		remove: global.r
	},
	typeOf: typeOf,
	require: requireFactory( resolveURL ),
	define: defineFactory( resolveURL )
});
