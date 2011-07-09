globals.add( "testGlobal", "testGlobal" );

expose({
	get: function() {
		return window.testGlobal;
	}
});
