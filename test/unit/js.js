module( "js" );

test( "js", function() {
	expect( 5 );
	stop();
	strictEqual( use.js( "data/script1.js", "data/script2.js", function() {
		strictEqual( window.TEST, "hello world", "global set properly" );
		window.TEST = "boom";
		use.js( "data/script1.js", "data/script2.js", function() {
			strictEqual( window.TEST, "boom", "global not reset" );
			delete window.TEST;
			start();
		});
	}), use, "use.js is chainable" );
});
