module( "script" );

asyncTest( "script", 5, function() {
	window.TEST = 0;
	strictEqual( use.script( "data/script1.js", "data/script2.js", function() {
		strictEqual( window.TEST, 9, "global set properly" );
		window.TEST = 0;
		use.script( "data/script1.js", "data/script2.js", function() {
			strictEqual( window.TEST, 0, "global not reset" );
			window.TEST = undefined;
			try {
				delete window.TEST;
			} catch( e ) {}
			start();
		} );
	} ), use, "use.script is chainable" );
} );
