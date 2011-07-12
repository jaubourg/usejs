var r_alias = /^!/,
	aliasCount = 0,
	aliases = {};

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

function defineAliasSandboxFactory( resolveURL, filter ) {
	return function( _, init, done ) {
		var module = {};
		init( module, resolveURL );
		if ( filter ) {
			filter.call( module );
		}
		done();
	};
}

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
