"use strict";

module.exports = function( options ) {
	var cache = {};
	return function( key, value ) {
		if ( arguments.length < 2 ) {
			return cache[ key ] || ( cache[ key ] = options.get( key ) );
		}
		var oldValue = cache[ key ];
		cache[ key ] = options.set ? options.set( key, value ) : value;
		return oldValue;
	};
};
