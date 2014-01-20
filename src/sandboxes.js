function scriptSandbox( resolveURL, filter ) {
	return function( url, init ) {
		functionSandbox( resolveURL, function( use ) {
			filter.call( this, use, function( callback ) {
				return use.hold( function( release ) {
					loadScript( url, function() {
						if ( callback ) {
							later( callback );
						}
						later( release );
					} );
				} );
			} );
		} )( url, init );
	};
}

function functionSandbox( resolveURL, filter ) {
	return function( _, init ) {
		var tmp = {};
		var done = init( tmp, resolveURL );
		if ( filter ) {
			filter.call( {}, tmp.use );
		}
		done();
	};
}

var R_DIRECTORY = /[^\/]+$/;

function iframeSandbox( url, init ) {
	var win, doc, head, base, onload;
	var frm = create( "iframe" );
	frm.style.display = "none";
	add( frm );
	doc = ( ( win = frm.contentWindow ) ).document;
	doc.open();
	onload = init( win, resolveURLFactory( doc ) );
	doc.close();
	base = create( "base", doc );
	base.href = url.replace( R_DIRECTORY, "" );
	add( base, ( ( head = get( "head", doc )[ 0 ] ) ) );
	loadScript( url, onload, head );
}
