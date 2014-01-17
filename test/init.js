( function() {

	function getJSON( url ) {
		var xhr = new XMLHttpRequest();
		xhr.open( "GET", url, false );
		xhr.send();
		return ( new Function( "return " + xhr.responseText + ";" ) )();
	}

	function loadScript( url ) {
		document.write( "<script src='" + url +"'></script>\n" );
	}

	loadScript( "../dist/use.js" );

	loadScript( "qunit/qunit/qunit.js" );

	for( var unit in getJSON( "units.json" ) ) {
		loadScript( "unit/" + unit + ".js" );
	}

} )();

var testCount = 0;
