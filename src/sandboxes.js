var r_directory = /[^\/]+$/;

function iframe( url, init ) {
	var win, doc, head, base, onload,
		frm = create( "iframe" );
	frm.style.display = "none";
	add( frm );
	doc = (( win = frm.contentWindow )).document;
	doc.open();
	onload = init( win, resolveURLFactory( doc ) );
	doc.close();
	base = create( "base", doc );
	base.href = url.replace( r_directory, "" );
	add( base, (( head = get( "head", doc )[ 0 ] )) );
	loadScript( url, onload, head );
}
