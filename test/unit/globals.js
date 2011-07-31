module( "globals" );

test( "globals", function() {
	expect( 7 );
	stop();
	use( "data/globals1.js", function( global1 ) {
		strictEqual( window.testGlobal, "testGlobal", "test global defined in current window" );
		strictEqual( global1.get(), "testGlobal", "test global defined in module" );
		use( "data/globals2.js", function( global2 ) {
			strictEqual( global2.get(), "testGlobal", "test global defined in newly loaded module" );
			strictEqual( use.globals.remove( "testGlobal" ), use.globals, "globals methods are chainable" );
			strictEqual( window.testGlobal, undefined, "test global removed from current window" );
			strictEqual( global1.get(), undefined, "test global removed from first module" );
			strictEqual( global2.get(), undefined, "test global removed from second module" );
			start();
		});
	});
});
