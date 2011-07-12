var marker = "_" + ( 1 * (new Date()) ),
	iframeCode = [
		"<base href=\"",
		undefined,
		"\"><script src=\"",
		undefined,
		"\"",
		ie ? " onreadystatechange=\"" + marker + "(this.readyState);\" onerror=\"" + marker + "();\"" : "",
		"><\/script>",
		ie ? "" : "<script>" + marker + "();<\/script>"
	],
	r_directory = /[^\/]+$/;

function iframe( url, init, done ) {
	iframeCode[ 1 ] = url.replace( r_directory, "" );
	iframeCode[ 3 ] = url;
	var win, doc,
		code = iframeCode.join( "" ),
		frm = create( "iframe" );
	frm.style.display = "none";
	add( frm );
	win = frm.contentWindow || frm.contentDocument;
	doc = win.document;
	doc.open();
	init( win, resolveURLFactory( doc ) );
	win[ marker ] = function( readyState ) {
		if ( done && testReadyState( readyState ) ) {
			later( done );
			done = undefined;
		}
	};
	doc.write( code );
	doc.close();
	url = win = doc = code = frm = init = undefined;
}
