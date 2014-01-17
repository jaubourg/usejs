module( "bridge" );

asyncTest( "bridge", 6, function() {
	var loaded = false;
	strictEqual( use.bridge( "data/script.js", function( use ) {
		loaded = true;
		strictEqual( this.use, use, "this contains use" );
		use( "data/simple.module.js#getCount", function( getCount ) {
			use.expose( {
				getCount: getCount,
				method: $.noConflict().twice
			} );
		} );
	} ), use, "bridge is chainable" );
	setTimeout( function() {
		ok( !loaded, "bridge is not executed immediately" );
		use( "data/script.js", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.method( 5 ), 10, "method received as module.method" );
			strictEqual( module.getCount(), testCount++, "getCount attached correctly" );
			start();
		} );
	}, 2000 );
} );


