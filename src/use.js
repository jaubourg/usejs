(function( window, document, undefined ) {

var toString = {}.toString,
	r_type = /^\[.*? (.*?)\]$/,
	types = {};

function typeOf( value ) {
	value = ( value == undefined ? String( value ) : toString.call( value ) );
	if ( !types[ value ] ) {
		types[ value ] = value.replace( r_type, "$1" ).toLowerCase();
	}
	return types[ value ];
}

var documentElement = document.documentElement;

function add( domNode, parent ) {
	( parent || documentElement ).appendChild( domNode );
}

function remove( domNode, parent ) {
	( parent || documentElement ).removeChild( domNode );
}

function getByTagName( tag, parent ) {
	return ( parent || document ).getElementsByTagName( tag );
}

function create( tag, parent ) {
	return ( parent || document ).createElement( tag );
}

function iframe( code, callback ) {
	var win, doc,
		frm = create( "iframe" );
	frm.style.display = "none";
	add( frm );
	win = frm.contentWindow || frm.contentDocument;
	doc = win.document;
	doc.open();
	if ( callback ) {
		callback( frm, win, doc );
	}
	doc.write( code );
	doc.close();
	return doc;
}

function error( msg ) {
	throw new Error( msg );
}

var ie = (function(){
		var v = 3,
			div = create( "div" ),
			all = getByTagName( "i", div );
		do {
			div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->";
		} while ( all[ 0 ] );
		return v > 4 ? v : 0;
	})();


function resolveURLFactory( doc ) {
	var	div,
		a = [ create( "a", doc ) ];
	if ( ie < 7 ) {
		div = create( "div", doc );
		add( a[ 0 ], div );
		a = getByTagName( "a", div );
	}
	return function( url ) {
		a[ 0 ].href = url;
		if ( div ) {
			div.innerHTML = div.innerHTML;
		}
		return a[ 0 ].href;
	};
}

var resolveURL = resolveURLFactory( document );

function later( fn, args ) {
	return setTimeout(function() {
		fn.apply( undefined, args );
	}, 0 );
}

var r_notLoadedOrComplete = /i/;

function testReadyState( readyState ) {
	return !( readyState && r_notLoadedOrComplete.test( readyState ) );
}

var marker = "_" + ( 1 * (new Date()) ),
	iframeSandboxCode = [
		"<base href=\"",
		undefined,
		"\"><script src=\"",
		undefined,
		"\"",
		ie ? " onreadystatechange=\"" + marker + "(this.readyState);\" onerror=\"" + marker + "();\"" : "",
		"></script>",
		ie ? "" : "<script>" + marker + "();</script>"
	],
	r_directory = /[^\/]+$/;

function iframeSandbox( url, init, done ) {
	iframeSandboxCode[ 1 ] = url.replace( r_directory, "" );
	iframeSandboxCode[ 3 ] = url;
	iframe( iframeSandboxCode.join( "" ), function( iframe, win, doc ) {
		var complete;
		init( win, resolveURLFactory( doc ) );
		win[ marker ] = function( readyState ) {
			if ( !complete && testReadyState( readyState ) ) {
				complete = true;
				done();
			}
		};
	});
}

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

function join( futures, callbacks ) {
	var i, length,
		joined = Future();
	for( i = 0, length = callbacks.length; i < length ; i++ ) {
		joined.g( callbacks[ i ] );
	}
	function set( i ) {
		return function( value ) {
			futures[ i ] = value;
			if ( !(( --length )) ) {
				joined.s.apply( undefined, futures );
			}
		};
	}
	for ( i = 0, length = futures.length ; i < length ; i++ ) {
		futures[ i ].g( set( i ) );
	}
}

function Module( add, remove ) {
	var object = {},
		locked = false;
	return {
		a: function( id, value ) {
			if ( locked ) {
				error( "expose after init" );
			}
			if ( id != undefined ) {
				if ( arguments.length === 1 ) {
					value = id;
					for ( id in value ) {
						object[ id ] = value[ id ];
						if ( add ) {
							add( id, value[ id ] );
						}
					}
				} else if ( arguments.length ) {
					object[ id ] = value;
					if ( add ) {
						add( id, value );
					}
				}
			}
		},
		r: function( id ) {
			if ( locked ) {
				error( "remove after init" );
			}
			if ( id in object ) {
				delete object[ id ];
				if ( remove ) {
					remove( id );
				}
			}
		},
		v: function( newObject ) {
			if ( newObject != undefined ) {
				if ( locked ) {
					error( "set after init" );
				}
				object = newObject;
			}
			return object;
		},
		l: function() {
			locked = true;
		}
	};
}

var r_alias = /^!/,
	aliases = {};

function requireFactory( resolveURL, action ) {
	return function() {
		if ( action ) {
			action( arguments );
		}
		var tmp,
			futures = [],
			callbacks = [],
			args = arguments,
			i = 0,
			length = args.length;
		for( ; i < length; i++ ) {
			tmp = args[ i ];
			if ( typeOf( tmp ) === "function" ) {
				callbacks.push( tmp );
			} else {
				futures.push( loadModule( aliases[ tmp ] || resolveURL( tmp ), iframeSandbox ) );
			}
		}
		join( futures, callbacks );
	};
}

function defineScriptSandboxFactory( resolveURL, filter ) {
	return function( url, init, done ) {
		var script = document.createElement( "script" ),
			windowId,
			tmp;
		script.async = true;
		script.onload = script.onreadystatechange = function() {
			if ( testReadyState( script.readyState ) ) {
				documentElement.removeChild( script );
				script = script.onload = script.onreadystatechange = null;
				tmp = {};
				init( tmp, resolveURL );
				if ( filter ) {
					filter.call( tmp );
				}
				done();
			}
		};
		script.src = url;
		documentElement.insertBefore( script, documentElement.firstChild );
	};
}

function defineAliasSandboxFactory( _, filter ) {
	return function( _, init, done ) {
		var module = {};
		init( module, resolveURL );
		if ( filter ) {
			filter.call( module );
		}
		done();
	};
}

var aliasCount = 0;

function defineFactory( resolveURL, action ) {
	return {
		script: function define( url, filter ) {
			if ( action ) {
				action( arguments );
			}
			if ( filter && typeOf( filter ) !== "function" ) {
				filter = undefined;
			}
			url = resolveURL( url );
			loadModule( url, defineScriptSandboxFactory( resolveURL, filter ), true );
		},
		alias: function( alias, urlOrFunction ) {
			var func = ( typeOf( urlOrFunction ) === "function" ) && urlOrFunction,
				url = resolveURL( func ? ( marker + ( aliasCount++ ) ) : urlOrFunction );
			if ( func ) {
				loadModule( url, defineAliasSandboxFactory( resolveURL, func ), true );
			}
			aliases[ alias ] = url;
		}
	};
}

var windows = [ window ],
	global = Module( function( id, value ) {
		for ( var i = 0, length = windows.length; i < length; i++ ) {
			windows[ i ][ id ] = value;
		}
	}, function( id ) {
		for ( var i = 0, length = windows.length; i < length; i++ ) {
			if ( ie ) {
				windows[ i ][ id ] = undefined;
			} else {
				delete windows[ i ][ id ];
			}
		}
	});

global.a({
	globals: {
		add: global.a,
		remove: global.r
	},
	typeOf: typeOf,
	require: requireFactory( resolveURL ),
	define: defineFactory( resolveURL )
});

var r_splitURL = /^(.*?)(#.*)?$/,
	futures = {},
	push = windows.push;

function loadModule( url, sandBox, delayed ) {
	var future,
		hash = r_splitURL.exec( url );
	url = hash[ 1 ];
	hash = ( hash[ 2 ] || "#" ).substr( 1 );
	future = futures[ url ] || (( futures[ url ] = Future( function( future ) {
		var module = Module(),
			count = 1;
		function dec() {
			if ( !(( --count )) ) {
				module.l();
				future.s( module.v() );
			}
		}
		function inc( args ) {
			if ( count ) {
				count++;
				push.call( args, dec );
			}
		}
		sandBox( url, function( win, resolveURL ) {
			windows.push( win );
			var globals = global.v(),
				key;
			for ( key in globals ) {
				win[ key ] = globals[ key ];
			}
			win.require = requireFactory( resolveURL, inc );
			win.define = defineFactory( resolveURL, inc );
			win.expose = module.a;
			win.module = module.v;
		}, dec );
	}, delayed ) ));
	if ( hash ) {
		hash = hash.split( "." );
		future = future.f(function( module ) {
			for ( var i = 0, length = hash.length; i < length; i++ ) {
				module = module[ hash[ i ] ];
			}
			return module;
		});
	}
	return future;
}

})( window, document );
