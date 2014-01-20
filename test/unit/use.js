"use strict";

module( "use" );

asyncTest( "simple", 5, function() {
	var module;
	use( "data/simple.module.js", function( _module ) {
		module = _module;
		strictEqual( module.getCount(), window.testCount++, "First use of module OK" );
	} );
	use( "../test/data/simple.module.js", function( _module ) {
		strictEqual( _module, module, "Module only retrieved once" );
		strictEqual( module.getCount(), window.testCount++, "Second use of module OK" );
	} );
	use( "data/simple.module.js#getCount", function( getCount ) {
		strictEqual( getCount, module.getCount, "Module only retrieved once" );
		strictEqual( getCount(), window.testCount++, "Third use of module OK" );
		start();
	} );
} );

asyncTest( "complex", 5, function() {
	var module;
	use( "data/complex.module.js", function( _module ) {
		module = _module;
		strictEqual( module.getDoubleCount(), ( window.testCount++ ) * 2, "First use of module OK" );
	} );
	use( "../test/data/complex.module.js", function( _module ) {
		strictEqual( _module, module, "Module only retrieved once" );
		strictEqual( module.getDoubleCount(), ( window.testCount++ ) * 2, "Second use of module OK" );
	} );
	use( "data/complex.module.js#getDoubleCount", function( getCount ) {
		strictEqual( getCount, module.getDoubleCount, "Module only retrieved once" );
		strictEqual( getCount(), ( window.testCount++ ) * 2, "Third use of module OK" );
		start();
	} );
} );

asyncTest( "none", 1, function() {
	use( function() {
		strictEqual( arguments.length, 0, "called back with no argument" );
		start();
	} );
} );

asyncTest( "multiple", 2, function() {
	use( "data/simple.module.js", "data/complex.module.js", function( simple, complex ) {
		strictEqual( simple.getCount(), window.testCount++, "simple count ok" );
		strictEqual( complex.getDoubleCount(), ( window.testCount++ ) * 2, "double count ok" );
		start();
	} );
} );

asyncTest( "multiple - array", 2, function() {
	use( [ "data/simple.module.js", "data/complex.module.js" ], function( modules ) {
		strictEqual( modules[ 0 ].getCount(), window.testCount++, "simple count ok" );
		strictEqual( modules[ 1 ].getDoubleCount(), ( window.testCount++ ) * 2, "double count ok" );
		start();
	} );
} );
