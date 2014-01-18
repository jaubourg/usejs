module( "script" );

asyncTest( "script", 5, function() {
	strictEqual( use.script( "data/script1.js", "data/script2.js", function() {
		strictEqual( window.TEST, "hello world", "global set properly" );
		window.TEST = "boom";
		use.script( "data/script1.js", "data/script2.js", function() {
			strictEqual( window.TEST, "boom", "global not reset" );
			window.TEST = undefined;
			try {
				delete window.TEST;
			} catch( e ) {}
			start();
		} );
	} ), use, "use.script is chainable" );
} );
