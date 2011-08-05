var needsRefresh;

function resolveURLFactory( doc ) {
	var	div = create( "div", doc ),
		a = get( "a", div );
	add( create( "a", doc ), div );
	return function( url ) {
		a[ 0 ].href = url;
		if ( needsRefresh ) {
			// On older IEs, the whole div needs to be refreshed
			// (feature detected later in this very file)
			div.innerHTML = div.innerHTML;
		}
		return a[ 0 ].href;
	};
}

var resolveURL = resolveURLFactory( document );

needsRefresh = ( resolveURL( "" ) === "" );
