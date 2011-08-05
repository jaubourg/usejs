module( "route" );

test( "simple", function() {
	expect( 2 );
	stop();
	strictEqual( use.route( "simple", "../test/data/simple.module.js" ), use, "route is chainable" );
	use( "data/simple.module.js", "simple", function( module, redirect ) {
		strictEqual( module, redirect, "proper redirect" );
		start();
	});
});

test( "with hash", function() {
	expect( 2 );
	stop();
	use.route( "complex", "../test/data/complex.module.js#getDoubleCount" );
	use( "data/complex.module.js#getDoubleCount", "complex", function( moduleMethod, redirectMethod ) {
		strictEqual( moduleMethod, redirectMethod, "proper redirect" );
		strictEqual( redirectMethod(), ( testCount++ ) * 2, "double count ok" );
		start();
	});
});

test( "recursive", function() {
	expect( 1 );
	stop();
	use.route({
		recurse_simple: "data/route.recurse.js#simple",
		recursive: "recurse_simple"
	});
	use( "recursive#getCount", "data/simple.module.js", function( getCount, simple ) {
		strictEqual( getCount, simple.getCount, "hash properly built" );
		start();
	});
});

test( "function", function() {
	expect( 4 );
	stop();
	var loaded = false;
	use.route( "static", function( use ) {
		loaded = true;
		strictEqual( this.use, use, "this contains use" );
		use( "data/simple.module.js#getCount", function( getCount ) {
			use.expose({
				getCount: getCount
			});
		});
	});
	setTimeout(function() {
		ok( !loaded, "define is not done immediately" );
		use( "static", function( module ) {
			ok( loaded, "define executed" );
			strictEqual( module.getCount(), testCount++, "getCount attached correctly" );
			start();
		});
	}, 2000 );
});

test( "alias", function() {
	expect( 1 );
	stop();
	use.route( "alias:simple", "data/simple.module.js" );
	use( "data/alias.js", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "global alias working" );
		start();
	});
});

test( "rewriting", function() {
	expect( 2 );
	stop();
	use.route( "module:/*", "data/$(1).module.js" );
	use( "module:/simple", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "rewriting working (1/2)" );
		use( "module:/complex", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "rewriting working (2/2)" );
			start();
		});
	});
});

test( "rewriting - undefined", function() {
	expect( 1 );
	stop();
	use.route({
		"undefined": "data/simple.module.js",
		"wonderbar": "$0"
	});
	use( "wonderbar", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "rewriting with no source outputs 'undefined'" );
		start();
	});
});

test( "folder", function() {
	expect( 2 );
	stop();
	use.route( "http://mydomain/some/folder/", "data/" );
	use( "http://mydomain/some/folder/simple.module.js", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "folder working (1/2)" );
		use( "http://mydomain/some/folder/complex.module.js", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "folder working (2/2)" );
			start();
		});
	});
});

test( "folder - no slash", function() {
	expect( 2 );
	stop();
	use.route( "http://whatever/some/folder", "data" );
	use( "http://whatever/some/folder/simple.module.js", "data/simple.module.js", function( alias, simple ) {
		strictEqual( alias, simple, "folder working (1/2)" );
		use( "http://whatever/some/folder/complex.module.js", "data/complex.module.js", function( alias, complex ) {
			strictEqual( alias, complex, "folder working (2/2)" );
			start();
		});
	});
});
