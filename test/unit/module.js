module( "module" );

test( "base", function() {
	expect( 1 );
	stop();
	require( "data/module.js", function( module ) {
		strictEqual( module(), "hello world", "everything exposed correctly" );
		start();
	});
});
