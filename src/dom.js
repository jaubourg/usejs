var documentElement = document.documentElement,
	r_notLoadedOrComplete = /i/;

function testReadyState( readyState ) {
	return !( readyState && r_notLoadedOrComplete.test( readyState ) );
}

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
