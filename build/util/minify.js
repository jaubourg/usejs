"use strict";

var uglify = require( "uglify-js" );

module.exports = function( fileDesc ) {
	var tmp = uglify.minify( fileDesc.content, {
		fromString: true,
		outSourceMap: fileDesc.path + ".map"
	} );
	return {
		path: fileDesc.path,
		content: tmp.code,
		positions: fileDesc.positions
	};
};
