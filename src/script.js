var scripts = {};

function loadScript( url, callback, parent ) {
	if ( parent ) {
		loadText( url, function( text ) {
			var script = create( "script", parent.ownerDocument );
			script.text = text;
			add( script, parent );
			parent.removeChild( script );
			callback( url );
		} );
	} else {
		( scripts[ url ] || ( ( scripts[ url ] = Future(function( future ) {
			loadScript( url, future.s, documentElement );
		} ) ) ) ).g( callback );
	}
}
