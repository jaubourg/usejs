// Future constructor
// init( future ) is called right after the future has been created
// and before the constructor returns, unless onDemand is true, in which
// case init is called during the first call to future.g, effectively
// making the actual retrieval of the value "on demand".
function Future( init, onDemand ) {
	var callbacks = [],
		values,
		future = {
			// Get the value using function callback( value )
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
			// Set the value (will control if not already called)
			// fires all attached callbacks if needed
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
			// Filter the value: returns a new Future which value
			// will be equal to fn( currentFuture.value )
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
