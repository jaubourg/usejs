require( "simple.module.js#getCount", function( getCount ) {
	expose({
		getDoubleCount: function() {
			return getCount()*2;
		}
	});
});
