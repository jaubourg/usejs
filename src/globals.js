// List of global objects (windows and functionSandbox contexts)
var windows = [ window ];

// The "global" globals object
var globalsRef = {};

// The global repository is a module of sort that will propagate its
// properties into the global objects listed in the "windows" array
var globals = Module( globalsRef, function( id, value ) {
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
} );

// Finalize the creation of the "global" globals object
extend( globalsRef, {
	"add": globals.a,
	"remove": globals.r
} );
