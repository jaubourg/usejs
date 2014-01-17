var strictEqual = window.top.strictEqual;

use.hold( function( release ) {
	setTimeout( function() {
		use.expose( {
			hello: "world"
		} );
		release();
	}, 100 );
} );

strictEqual( use.done( function( module ) {
	strictEqual( module.hello, "world", "done called" );
} ), use, "use.done is chainable" );
