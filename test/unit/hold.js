module( "hold" );

test( "hold", function() {
	expect( 6 );
	stop();
	var expected = {
			one: 1,
			two: 2,
			three: 3,
			four: 4
		},
		loaded;
	use.globals.add( "holdDone", function() {
		setTimeout(function() {
			ok( !loaded, "hold delays loading" );
		}, 200 );
	});
	use( "data/hold.js", function( module ) {
		loaded = true;
		ok( module.chainable, "hold is chainable" );
		for ( var key in expected ) {
			strictEqual( module[ key ], expected[ key ], "exposed field " + key + " equals " + expected[ key ] );
		}
		use.globals.remove( "holdDone" );
		start();
	});
});
