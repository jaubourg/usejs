var testCount = 0;

test( "require - simple module", function() {
	expect( 5 );
	stop();
	var module;
	require( "data/simple.module.js", function( _module ) {
		module = _module;
		strictEqual( module.getCount(), testCount++, "First use of module OK" );
	});
	require( "../test/data/simple.module.js", function( _module ) {
		strictEqual( _module, module, "Module only retrieved once" );
		strictEqual( module.getCount(), testCount++, "Second use of module OK" );
	});
	require( "data/simple.module.js#getCount", function( getCount ) {
		strictEqual( getCount, module.getCount, "Module only retrieved once" );
		strictEqual( getCount(), testCount++, "Third use of module OK" );
		start();
	});
});

test( "require - complex module", function() {
	expect( 5 );
	stop();
	var module;
	require( "data/complex.module.js", function( _module ) {
		module = _module;
		strictEqual( module.getDoubleCount(), ( testCount++ ) * 2, "First use of module OK" );
	});
	require( "../test/data/complex.module.js", function( _module ) {
		strictEqual( _module, module, "Module only retrieved once" );
		strictEqual( module.getDoubleCount(), ( testCount++ ) * 2, "Second use of module OK" );
	});
	require( "data/complex.module.js#getDoubleCount", function( getCount ) {
		strictEqual( getCount, module.getDoubleCount, "Module only retrieved once" );
		strictEqual( getCount(), ( testCount++ ) * 2, "Third use of module OK" );
		start();
	});
});

test( "require - multiple modules", function() {
	expect( 2 );
	stop();
	require( "data/simple.module.js", "data/complex.module.js", function( simple, complex ) {
		strictEqual( simple.getCount(), testCount++, "simple count ok" );
		strictEqual( complex.getDoubleCount(), ( testCount++ ) * 2, "double count ok" );
		start();
	});
});

test( "module", function() {
	expect( 1 );
	stop();
	require( "data/module.js", function( module ) {
		strictEqual( module(), "hello world", "everything exposed correctly" );
		start();
	});
});

test( "globals", function() {
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

test( "define.script", function() {
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

test( "define.alias - simple", function() {
	expect( 1 );
	stop();
	define.alias( "!simple", "../test/data/simple.module.js" );
	require( "data/simple.module.js", function( module ) {
		require( "!simple", function( alias ) {
			strictEqual( module, alias, "proper alias" );
			start();
		});
	});
});

test( "define.alias - with hash", function() {
	expect( 2 );
	stop();
	define.alias( "!complex", "../test/data/complex.module.js#getDoubleCount" );
	require( "data/complex.module.js#getDoubleCount", function( moduleMethod ) {
		require( "!complex", function( aliasMethod ) {
			strictEqual( moduleMethod, aliasMethod, "proper alias" );
			strictEqual( aliasMethod(), ( testCount++ ) * 2, "double count ok" );
			start();
		});
	});
});

test( "define.alias - function", function() {
	expect( 3 );
	stop();
	var loaded = false;
	define.alias( "!static", function() {
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
		require( "!static", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.getCount(), testCount++, "getCount attached correctly" );
			start();
		});
	}, 2000 );
});

