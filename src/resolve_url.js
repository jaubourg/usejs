var needsRefresh;

function resolveURLFactory( doc ) {
	var	div = create( "div", doc ),
		a = getByTagName( "a", div );
	add( create( "a", doc ), div );
	return function( url ) {
		a[ 0 ].href = url;
		if ( needsRefresh ) {
			div.innerHTML = div.innerHTML;
		}
		return a[ 0 ].href;
	};
}

var resolveURL = resolveURLFactory( document );

needsRefresh = ( resolveURL( "" ) === "" );
