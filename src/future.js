function Future( init, onDemand ) {
	var callbacks = [],
		values,
		future = {
			g: function( callback ) {
				if ( onDemand ) {
					onDemand = false;
					if ( init ) {
						init( future );
					}
				}
				if ( callbacks ) {
					callbacks.push( callback );
				} else {
					later( callback, values );
				}
			},
			s: function() {
				if ( !values ) {
					var cbs = callbacks,
						i = 0,
						length = cbs.length;
					callbacks = undefined;
					values = arguments;
					for ( ; i < length ; i++ ) {
						later( cbs[ i ], values );
					}
				}
			},
			f: function( fn ) {
				return Future( function( filtered ) {
					future.g(function( value ) {
						filtered.s( fn( value ) );
					});
				}, onDemand );
			}
		};
	if ( !onDemand && init ) {
		init( future );
	}
	return future;
}
