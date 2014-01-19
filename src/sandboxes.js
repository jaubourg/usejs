function scriptSandbox( resolveURL, filter ) {
	return function( url, init ) {
/*		loadScript( url, function() {
			functionSandbox( resolveURL, filter )( url, init );
		} );*/
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
			filter.call( {}, tmp[ "use" ] );
		}
		done();
	};
}

var r_directory = /[^\/]+$/;

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
	base.href = url.replace( r_directory, "" );
	add( base, ( ( head = get( "head", doc )[ 0 ] ) ) );
	loadScript( url, onload, head );
}
