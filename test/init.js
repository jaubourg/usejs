( function() {

	"use strict";

	window.testCount = 0;

	window.unregisterGlobal = function( name ) {
		window[ name ] = undefined;
		try {
			delete window[ name ];
		} catch ( e ) {}
	};

} )();