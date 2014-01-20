"use strict";

use( "simple.module.js#getCount", function( getCount ) {
	use.expose( {
		getDoubleCount: function() {
			return getCount()*2;
		}
	} );
} );
