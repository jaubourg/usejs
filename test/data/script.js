"use strict";

( function( window ) {

	var old = window.$;
	var lib = {
		noConflict: function() {
			window.$ = old;
			return lib;
		},
		twice: function( num ) {
			return 2 * num;
		}
	};

	window.$ = lib;

} )( window );
