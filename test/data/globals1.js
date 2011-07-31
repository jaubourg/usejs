use.globals.add( "testGlobal", "testGlobal" );

use.expose({
	get: function() {
		return window.testGlobal;
	}
});
