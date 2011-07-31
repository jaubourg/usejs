module( "use" );

test( "simple", function() {
	expect( 5 );
	stop();
	var module;
	use( "data/simple.module.js", function( _module ) {
		module = _module;
		strictEqual( module.getCount(), testCount++, "First use of module OK" );
	});
	use( "../test/data/simple.module.js", function( _module ) {
		strictEqual( _module, module, "Module only retrieved once" );
		strictEqual( module.getCount(), testCount++, "Second use of module OK" );
	});
	use( "data/simple.module.js#getCount", function( getCount ) {
		strictEqual( getCount, module.getCount, "Module only retrieved once" );
		strictEqual( getCount(), testCount++, "Third use of module OK" );
		start();
	});
});

test( "complex", function() {
	expect( 5 );
	stop();
	var module;
	use( "data/complex.module.js", function( _module ) {
		module = _module;
		strictEqual( module.getDoubleCount(), ( testCount++ ) * 2, "First use of module OK" );
	});
	use( "../test/data/complex.module.js", function( _module ) {
		strictEqual( _module, module, "Module only retrieved once" );
		strictEqual( module.getDoubleCount(), ( testCount++ ) * 2, "Second use of module OK" );
	});
	use( "data/complex.module.js#getDoubleCount", function( getCount ) {
		strictEqual( getCount, module.getDoubleCount, "Module only retrieved once" );
		strictEqual( getCount(), ( testCount++ ) * 2, "Third use of module OK" );
		start();
	});
});

test( "multiple", function() {
	expect( 2 );
	stop();
	use( "data/simple.module.js", "data/complex.module.js", function( simple, complex ) {
		strictEqual( simple.getCount(), testCount++, "simple count ok" );
		strictEqual( complex.getDoubleCount(), ( testCount++ ) * 2, "double count ok" );
		start();
	});
});
