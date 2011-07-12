function resolveURLFactory( doc ) {
	var	div,
		a = [ create( "a", doc ) ];
	if ( ie < 7 ) {
		div = create( "div", doc );
		add( a[ 0 ], div );
		a = getByTagName( "a", div );
	}
	return function( url ) {
		a[ 0 ].href = url;
		if ( div ) {
			div.innerHTML = div.innerHTML;
		}
		return a[ 0 ].href;
	};
}
