module( "done" );

use.hold(function( release ) {
	test( "done", function() {
		stop();
		strictEqual( use.done(function( module ) {
			strictEqual( module.test, "hello world" );
			start();
		}), use, "use.done is chainable" );
		setTimeout(function() {
			use.expose( "test", "hello world" );
			release();
		}, 500 );
	});
});
