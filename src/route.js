var routes = {};

function splitURL( url ) {
	url = r_splitURL.exec( url );
	var tmp = url[ 1 ].split( "/" );
	if ( !tmp[ tmp.length - 1 ] ) {
		tmp.pop();
	}
	return {
		u: tmp,
		h: url[ 2 ]
	};
}

function setRoute( route, url ) {
	route = splitURL( route ).u;
	url = splitURL( url );
	var index = 0,
		length = route.length,
		current = routes;
	for( ; index < length; index++ ) {
		current = current[ route[ index ] ] || (( current[ route[ index ] ] = {} ));
	}
	current[ "/" ] = url.u;
	current[ "/#" ] = url.h;
}

// Put outside of the _resolveRoute closure
// so that to save memory (and speed in IE)
var r_star = /\$\(([0-9]+)\)|^\$([0-9]+)$/g,
	stars;
function fStars( _, $1, $2 ) {
	return "" + stars[ 1 * ( $1 || $2 ) - 1 ];
}

function _resolveRoute( data, hashes ) {
	if ( data.h ) {
		hashes.push( data.h );
	}
	var url = data.u,
		current = routes,
		index = 0,
		length = url.length,
		tmp;
	stars = [];
	for( index = 0, length = url.length; index < length ; index++ ) {
		tmp = url[ index ];
		if ( current[ tmp ] ) {
			current = current[ tmp ];
		} else if ( current[ "*" ] ) {
			stars.push( tmp );
			current = current[ "*" ];
		} else {
			break;
		}
	}
	if (( tmp = current[ "/" ] )) {
		data.u = url = tmp.concat( url.slice( index ) );
		for ( index = 0, length = tmp.length; index < length; index++ ) {
			url[ index ] = url[ index ].replace( r_star, fStars );
		}
		stars = undefined;
		data.h = current[ "/#" ];
		_resolveRoute( data, hashes );
	}
}

function resolveRoute( url ) {
	url = splitURL( url );
	var hashes = [];
	_resolveRoute( url, hashes );
	url = url.u.join( "/" );
	if ( hashes.length ) {
		hashes.reverse();
		url += "#" + hashes.join( "." );
	}
	return url;
}
