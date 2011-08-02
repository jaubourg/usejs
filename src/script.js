var scripts = {};

function loadScript( url, callback, parent ) {
	if ( parent ) {
		var script = create( "script", parent.ownerDocument ),
			done = function() {
				if ( !/i/.test( script.readyState || "" ) ) {
					parent.removeChild( script );
					done = script = script.onload = script.onreadystatechange = null;
					callback();
				}
			};
		extend( script, {
			"async": true,
			"onload": done,
			"onreadystatechange": done,
			"src": url
		});
		add( script, parent );
	} else {
		( scripts[ url ] || (( scripts[ url ] = Future(function( future ) {
			loadScript( url, future.s, documentElement );
		}) )) ).g( callback );
	}
}
