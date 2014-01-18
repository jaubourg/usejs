module( "route" );

asyncTest( "simple", 2, function() {
	strictEqual( use.route( "simple", "../test/data/simple.module.js" ), use, "route is chainable" );
	use( "data/simple.module.js", "simple", function( module, redirect ) {
		strictEqual( module, redirect, "proper redirect" );
		start();
	} );
} );

asyncTest( "with hash", 2, function() {
	use.route( "complex", "../test/data/complex.module.js#getDoubleCount" );
	use( "data/complex.module.js#getDoubleCount", "complex", function( moduleMethod, redirectMethod ) {
		strictEqual( moduleMethod, redirectMethod, "proper redirect" );
		strictEqual( redirectMethod(), ( testCount++ ) * 2, "double count ok" );
		start();
	} );
} );

asyncTest( "recursive", 1, function() {
	use.route( {
		recurse_simple: "data/route.recurse.js#simple",
		recursive: "recurse_simple"
	} );
	use( "recursive#getCount", "data/simple.module.js", function( getCount, simple ) {
		strictEqual( getCount, simple.getCount, "hash properly built" );
		start();
	} );
} );

asyncTest( "alias", 1, function() {
	use.route( "alias:simple", "data/simple.module.js" );
	use( "data/alias.js", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "global alias working" );
		start();
	} );
} );

asyncTest( "rewriting", 2, function() {
	use.route( "module:*", "data/$(1).module.js" );
	use( "module:simple", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "rewriting working (1/2)" );
		use( "module:complex", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "rewriting working (2/2)" );
			start();
		} );
	} );
} );

asyncTest( "rewriting - function", 2, function() {
	use.route( "moduleFunction:*", function( _, name ) {
		return "data/" + name +".module.js";
	} );
	use( "moduleFunction:simple", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "rewriting working (1/2)" );
		use( "moduleFunction:complex", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "rewriting working (2/2)" );
			start();
		} );
	} );
} );

asyncTest( "rewriting - undefined", 1, function() {
	use.route( {
		"undefined": "data/simple.module.js",
		"wonderbar": "$0"
	} );
	use( "wonderbar", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "rewriting with no source outputs 'undefined'" );
		start();
	} );
} );

asyncTest( "folder", 2, function() {
	use.route( "http://mydomain/some/folder/", "data/" );
	use( "http://mydomain/some/folder/simple.module.js", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "folder working (1/2)" );
		use( "http://mydomain/some/folder/complex.module.js", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "folder working (2/2)" );
			start();
		} );
	} );
} );

asyncTest( "folder - no slash", 2, function() {
	use.route( "http://whatever/some/folder", "data" );
	use( "http://whatever/some/folder/simple.module.js", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "folder working (1/2)" );
		use( "http://whatever/some/folder/complex.module.js", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "folder working (2/2)" );
			start();
		} );
	} );
} );

asyncTest( "define", 5, function() {
	var object = {};
	use.route.define( "global:object", object );
	use.route.define( "global:string", "string" );
	use.route.define( "global:false", false );
	use.route.define( "global:null", null );
	use.route.define( "global:undefined", undefined );
	use(
		"global:object",
		"global:string",
		"global:false",
		"global:null",
		"global:undefined",
		function( _object, _string, _false, _null, _undefined ) {
			strictEqual( _object, object, "object set properly" );
			strictEqual( _string, "string", "string set properly" );
			strictEqual( _false, false, "false set properly" );
			strictEqual( use.type( _null ), "object", "null cannot be a module" );
			strictEqual( use.type( _undefined ), "object", "undefined cannot be a module" );
			start();
		}
	);
} );

asyncTest( "define function", 4, function() {
	var loaded = false;
	use.route.define( "static", function( use, url ) {
		loaded = true;
		strictEqual( url, use.resolve( "static" ), "url given (" + url + ")" );
		use( "data/simple.module.js#getCount", function( getCount ) {
			use.expose( {
				getCount: getCount
			} );
		} );
	} );
	setTimeout( function() {
		ok( !loaded, "define is not done immediately" );
		use( "static", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.getCount(), testCount++, "getCount attached correctly" );
			start();
		} );
	}, 2000 );
} );

asyncTest( "define - function - rewriting", 5, function() {
	use.route.define( "template:/*", function( use, url, name ) {
		use.expose( {
			url: url,
			name: name
		} );
	} );
	use( "template:/calendar", "template:/panel", function( calendar, panel ) {
		strictEqual( calendar.url, "template:/calendar", "parameter passed (1/2)" );
		strictEqual( panel.url, "template:/panel", "parameter passed (2/2)" );
		strictEqual( calendar.name, "calendar", "parameter passed (1/2)" );
		strictEqual( panel.name, "panel", "parameter passed (2/2)" );
		use( "template:/panel", function( panelCopy ) {
			strictEqual( panel, panelCopy, "Unicity respected" );
			start();
		} );
	} );
} );
