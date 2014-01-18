var texts = {};

function loadText( url, callback ) {
	( texts[ url ] || ( texts[ url ] = Future( function( future ) {
		var xhr = new XMLHttpRequest();
		xhr.open( "GET", url );
		xhr.onload = function() {
			xhr.onload = null;
			future.s( xhr.responseText );
		};
		xhr.send();
	} ) ) ).g( callback );
}
