module( "done" );

test( "done", function() {
	stop();
	strictEqual( use.done( function( module ) {
		ok( true, "done called" );
		start();
	} ), use, "use.done is chainable" );
});
