( function() {

	"use strict";

	function buildFactory( getText ) {
		var R_CODE = /@CODE/g;
		var R_TEMPLATE = /@([A-Z]+)/g;
		function applyTemplate( template, data ) {
			return template.replace( R_TEMPLATE, function( _, $1 ) {
				return data[ $1 ];
			} );
		}
		function findFirstLine( template ) {
			template = template.split( "\n" );
			for ( var firstLine = 0; firstLine < template.length; firstLine++ ) {
				if ( R_CODE.test( template[ firstLine ] ) ) {
					return firstLine + 1;
				}
			}
		}
		return function( template, version, modulesOrCode, moduleRewrite ) {
			template = getText( template );
			var code = modulesOrCode;
			var lines = {};
			var firstLine = findFirstLine( template );
			var currentLine = firstLine;
			var filecode, filename;
			if ( moduleRewrite ) {
				code = "";
				for ( var module in modulesOrCode ) {
					filename = moduleRewrite.replace( "%%", module );
					filecode = getText( filename );
					currentLine += filecode.split( "\n" ).length - 1;
					lines[ filename ] = currentLine;
					code += filecode;
				}
			}
			return {
				code: applyTemplate( template, {
					CODE: code,
					DATE: new Date(),
					VERSION: version
				} ),
				fileForLine: function( line ) {
					var previousLine = firstLine;
					for ( var filename in lines ) {
						if ( line < lines[ filename ] ) {
							return {
								file: filename,
								line: line - previousLine + 1
							};
						}
						previousLine = lines[ filename ];
					}
				}
			};
		};
	}

	try {
		module.exports = buildFactory;
	} catch ( e ) {}

	return buildFactory;

} )();
