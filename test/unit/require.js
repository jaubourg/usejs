module( "require" );

test( "simple module", function() {
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

test( "complex module", function() {
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

test( "multiple modules", function() {
	expect( 2 );
	stop();
	require( "data/simple.module.js", "data/complex.module.js", function( simple, complex ) {
		strictEqual( simple.getCount(), testCount++, "simple count ok" );
		strictEqual( complex.getDoubleCount(), ( testCount++ ) * 2, "double count ok" );
		start();
	});
});
