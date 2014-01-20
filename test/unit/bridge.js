"use strict";

module( "bridge" );

asyncTest( "bridge", 5, function() {
	var loaded = false;
	strictEqual( use.bridge( "data/script.js", function( use, load ) {
		load( function() {
			loaded = true;
			use( "data/simple.module.js#getCount", function( getCount ) {
				use.expose( {
					getCount: getCount,
					method: window.$.noConflict().twice
				} );
			} );
		} );
	} ), use, "bridge is chainable" );
	setTimeout( function() {
		ok( !loaded, "bridge is not executed immediately" );
		use( "data/script.js", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.method( 5 ), 10, "method received as module.method" );
			strictEqual( module.getCount(), window.testCount++, "getCount attached correctly" );
			start();
		} );
	}, 50 );
} );

asyncTest( "bridge - dependency", 3, function() {
	use.bridge( "data/script-parent.js", function( use, load ) {
		ok( "true", "parent script bridge called" );
		load( function() {
			use.module( window.$ );
		} );
	} );
	use.bridge( "data/script-dependent.js", function( use, load ) {
		ok( "true", "dependent script bridge called" );
		use( "data/script-parent.js", function( $ ) {
			load( function() {
				use.module( {
					done: $.dependentLoaded
				} );
			} );
		} );
	} );
	use( "data/script-dependent.js", function( dependent ) {
		ok( dependent.done, "Works as intended" );
		start();
	} );
} );
