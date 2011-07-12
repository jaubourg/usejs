module( "define" );

test( "script", function() {
	expect( 4 );
	stop();
	var loaded = false;
	define.script( "data/script.js", function() {
		var module = this;
		loaded = true;
		this.require( "data/simple.module.js#getCount", function( getCount ) {
			module.expose({
				getCount: getCount,
				method: $.noConflict().twice
			});
		});
	});
	setTimeout(function() {
		ok( !loaded, "define is not done immediately" );
		require( "data/script.js", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.method( 5 ), 10, "method received as module.method" );
			strictEqual( module.getCount(), testCount++, "getCount attached correctly" );
			start();
		});
	}, 2000 );
});

test( "alias - simple", function() {
	expect( 1 );
	stop();
	define.alias( "simple", "../test/data/simple.module.js" );
	require( "data/simple.module.js", function( module ) {
		require( "simple", function( alias ) {
			strictEqual( module, alias, "proper alias" );
			start();
		});
	});
});

test( "alias - with hash", function() {
	expect( 2 );
	stop();
	define.alias( "complex", "../test/data/complex.module.js#getDoubleCount" );
	require( "data/complex.module.js#getDoubleCount", function( moduleMethod ) {
		require( "complex", function( aliasMethod ) {
			strictEqual( moduleMethod, aliasMethod, "proper alias" );
			strictEqual( aliasMethod(), ( testCount++ ) * 2, "double count ok" );
			start();
		});
	});
});

test( "alias - function", function() {
	expect( 3 );
	stop();
	var loaded = false;
	define.alias( "static", function() {
		var module = this;
		loaded = true;
		this.require( "data/simple.module.js#getCount", function( getCount ) {
			module.expose({
				getCount: getCount
			});
		});
	});
	setTimeout(function() {
		ok( !loaded, "define is not done immediately" );
		require( "static", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.getCount(), testCount++, "getCount attached correctly" );
			start();
		});
	}, 2000 );
});

