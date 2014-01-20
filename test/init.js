( function() {

	/* jshint -W054 */
	/* jshint -W060 */

	"use strict";

	// UTILITIES

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
		return new Function( "return " + getText( url ) +";" )();
	}

	// LOAD QUNIT

	document.write( "<link rel='stylesheet' media='screen' href='qunit/qunit/qunit.css' />\n" );
	loadScript( "qunit/qunit/qunit.js" );

	// LOAD USEJS

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
				var dist = getJSON( "../build/build.js" )( getText )
					( "../build/templates/full.js", config.version, config.modules, "../src/%%.js").code;
				document.write( "<script>//<!--\n" + dist + "\n//--></script>" );
			} )();
	}

	// LOAD UNIT TESTS

	for( var unit in getJSON( "units.json" ) ) {
		loadScript( "unit/" + unit + ".js" );
	}

	// Init for tests
	window.testCount = 0;

} )();
