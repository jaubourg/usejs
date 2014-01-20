"use strict";

module.exports = function extend( args ) {
	var obj = {};
	for ( var i = 0; i < args.length; i++ ) {
		if ( args[ i ] ) {
			for ( var key in args[ i ] ) {
				obj[ key ] = args[ i ][ key ];
			}
		}
	}
	return obj;
};
