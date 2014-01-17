function buildFactory( getText ) {
	var templates = {};
	var r_template = /@([A-Z]+)/g;
	function template( url, data ) {
		return ( templates[ url ] || ( templates[ url ] = getText( url ) ) ).replace( r_template, function( _, $1 ) {
			return data[ $1 ];
		} );
	}
	return function( templateURL, version, modulesOrCode, moduleRewrite ) {
		var code = modulesOrCode;
		if ( moduleRewrite ) {
			code = "";
			for ( var module in modulesOrCode ) {
				code += getText( moduleRewrite.replace( "%%", module ) );
			}
		}
		return template( templateURL, {
			CODE: code,
			DATE: new Date(),
			VERSION: version
		} );
	}
};

try {
	module.exports = buildFactory;
} catch( e ) {}

return buildFactory;