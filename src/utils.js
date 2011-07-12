var toString = {}.toString,
	r_type = /^\[.*? (.*?)\]$/,
	types = {};

function typeOf( value ) {
	value = ( value == undefined ? String( value ) : toString.call( value ) );
	if ( !types[ value ] ) {
		types[ value ] = value.replace( r_type, "$1" ).toLowerCase();
	}
	return types[ value ];
}

function error( msg ) {
	throw new Error( msg );
}

function later( fn, args ) {
	return setTimeout(function() {
		fn.apply( undefined, args || [] );
	}, 0 );
}
