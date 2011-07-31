module( "module" );

test( "module", function() {
	expect( 1 );
	stop();
	use( "data/module.js", function( module ) {
		strictEqual( module(), "hello world", "everything exposed correctly" );
		start();
	});
});
