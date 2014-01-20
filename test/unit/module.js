"use strict";

module( "module" );

asyncTest( "module", 1, function() {
	use( "data/module.js", function( module ) {
		strictEqual( module(), "hello world", "everything exposed correctly" );
		start();
	} );
} );
