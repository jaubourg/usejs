"use strict";

module( "done" );

asyncTest( "done", 2, function() {
	use( "data/done.js", function() {
		start();
	} );
} );
