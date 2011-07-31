var exposed = {
		one: 1,
		two: 2,
		three: 3,
		four: 4
	},
	key;

for( key in exposed ) {
	(function( key ) {
		use.expose( "chainable", use.hold(function( release ) {
			setTimeout(function() {
				use.expose( key, exposed[ key ] );
				release();
				release();
			}, 500 + Math.floor( Math.random() * 400 ) );
		}).hold === use.hold );
	})( key );
}

window.holdDone();
