var windows = [ window ],
	resolveURL = resolveURLFactory( document ),
	global = Module( function( id, value ) {
		for ( var i = 0, length = windows.length; i < length; i++ ) {
			windows[ i ][ id ] = value;
		}
	}, function( id ) {
		for ( var i = 0, length = windows.length; i < length; i++ ) {
			if ( ie ) {
				windows[ i ][ id ] = undefined;
			} else {
				delete windows[ i ][ id ];
			}
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
