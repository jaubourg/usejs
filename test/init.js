( function() {

	function loadScript( url ) {
		document.write( "<script src='" + url +"'></script>\n" );
	}

	function getText( url ) {
		var xhr = new XMLHttpRequest();
		xhr.open( "GET", url, false );
		xhr.send();
		return xhr.responseText;
	}

	function getJSON( url ) {
		return new Function( "return " + getText( url ) +";" )()
	}

	var hash = document.location.hash + "";

	switch( hash ) {
		case "#dist":
			loadScript( "../dist/use.js" );
			break;
		case "#min":
			loadScript( "../dist/use.min.js" );
			break;
		default:
			( function() {
				var config = getJSON( "../build/config.json" );
				var dist = getJSON( "../build/build.js" )( getText )( "../build/template.js", config.version, config.modules, "../src/%%.js" );
				document.write( "<script>//<!--\n" + dist + "\n//--></script>" );
			} )();
	}

	loadScript( "../bower_components/qunit/qunit/qunit.js" );

	for( var unit in getJSON( "units.json" ) ) {
		loadScript( "unit/" + unit + ".js" );
	}

} )();

var testCount = 0;
