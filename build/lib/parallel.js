"use strict";

module.exports = function( args ) {
	return function( callback ) {
		var count = args.length;
		var results = [];
		args.forEach( function( func, index ) {
			var called;
			func( function( value ) {
				if ( !called ) {
					results[ index ] = value;
					if ( !( --count ) ) {
						callback( results );
					}
				}
			} );
		} );
	};
};
