function loadScript( url, callback, parent ) {
	parent = parent || documentElement;
	var script = create( "script", parent.ownerDocument );
	function done() {
		if ( !/i/.test( script.readyState || "" ) ) {
			parent.removeChild( script );
			done = script = script.onload = script.onreadystatechange = null;
			callback();
		}
	}
	extend( script, {
		"async": true,
		"onload": done,
		"onreadystatechange": done,
		"src": url
	});
	add( script, parent );
}
