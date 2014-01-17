module( "hold" );

asyncTest( "hold", 6, function() {
	var expected = {
		one: 1,
		two: 2,
		three: 3,
		four: 4
	};
	var loaded;
	window.holdDone = function() {
		setTimeout( function() {
			ok( !loaded, "hold delays loading" );
		}, 200 );
	};
	use( "data/hold.js", function( module ) {
		loaded = true;
		ok( module.chainable, "hold is chainable" );
		for ( var key in expected ) {
			strictEqual( module[ key ], expected[ key ], "exposed field " + key + " equals " + expected[ key ] );
		}
		window.holdDone = undefined;
		start();
	} );
} );
