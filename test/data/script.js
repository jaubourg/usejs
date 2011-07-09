(function( window ) {

	var old = window.$,
		lib = {
			noConflict: function() {
				window.$ = old;
				return lib;
			},
			twice: function( num ) {
				return 2 * num;
			}
		};

	window.$ = lib;

})( window );
