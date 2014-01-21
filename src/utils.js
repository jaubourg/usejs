var R_TYPE = / |\]/;
var types = {};
var toString = types.toString;

function typeOf( value ) {
	return ( value == null ) ?
		types[ value ] || ( ( types[ value ] = "" + value ) ) :
		types[ ( ( value = toString.call( value ) ) ) ] ||
			( ( types[ value ] = value.split( R_TYPE )[ 1 ].toLowerCase() ) );
}

function error( msg ) {
	throw new Error( msg );
}

function later( fn, args ) {
	return setTimeout( function() {
		fn.apply( undefined, args || [] );
	} );
}

function keyValueFunction( self, fn ) {
	return function( key, value ) {
		if ( arguments.length < 2 ) {
			value = key;
			for ( key in value ) {
				fn( key, value[ key ] );
			}
		} else {
			fn( key, value );
		}
		return self;
	};
}

function extend( target, src ) {
	for (  var key in src ) {
		target[ key ] = src[ key ];
	}
}
