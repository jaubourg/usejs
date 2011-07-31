var windows = [ window ],
	globalsRef = {},
	globals = Module( globalsRef, function( id, value ) {
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

extend( globalsRef, {
	"add": globals.a,
	"remove": globals.r
});
