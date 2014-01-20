"use strict";

var exposed = {
	one: 1,
	two: 2,
	three: 3,
	four: 4
};

function expose( key ) {
	use.expose( "chainable", use.hold( function( release ) {
		setTimeout(function() {
			use.expose( key, exposed[ key ] );
			release();
			release();
		}, 60 + Math.floor( Math.random() * 20 ) );
	} ).hold === use.hold );
}

var key;

for ( key in exposed ) {
	expose( key );
}

window.top.holdDone();
