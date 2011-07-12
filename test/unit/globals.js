module( "globals" );

test( "base", function() {
	expect( 6 );
	stop();
	require( "data/globals1.js", function( global1 ) {
		strictEqual( window.testGlobal, "testGlobal", "test global defined in current window" );
		strictEqual( global1.get(), "testGlobal", "test global defined in module" );
		require( "data/globals2.js", function( global2 ) {
			strictEqual( global2.get(), "testGlobal", "test global defined in newly loaded module" );
			globals.remove( "testGlobal" );
			strictEqual( window.testGlobal, undefined, "test global removed from current window" );
			strictEqual( global1.get(), undefined, "test global removed from first module" );
			strictEqual( global2.get(), undefined, "test global removed from second module" );
			start();
		});
	});
});
