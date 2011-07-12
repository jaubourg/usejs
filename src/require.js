function requireFactory( resolveURL, action ) {
	return function() {
		if ( action ) {
			action( arguments );
		}
		var tmp,
			futures = [],
			callbacks = [],
			args = arguments,
			i = 0,
			length = args.length;
		for( ; i < length; i++ ) {
			tmp = args[ i ];
			if ( typeOf( tmp ) === "function" ) {
				callbacks.push( tmp );
			} else {
				futures.push( loadModule( aliases[ tmp ] || resolveURL( tmp ), iframe ) );
			}
		}
		join( futures, callbacks );
	};
}
