var routes = {};

function resolveRoute( url ) {
	var tmp = url,
		hashes = [];
	do {
		tmp = r_splitURL.exec( tmp );
		url = tmp[ 1 ];
		if ( tmp[ 2 ] ) {
			hashes.push( tmp[ 2 ] );
		}
	} while(( tmp = routes[ url ] ));

	if ( hashes.length ) {
		hashes.reverse();
		url += "#" + hashes.join( "." );
	}
	return url;
}
