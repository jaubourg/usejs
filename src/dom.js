var documentElement = document.documentElement;

function create( tag, doc ) {
	return ( doc || document ).createElement( tag );
}

function add( domNode, parent ) {
	( parent || documentElement ).appendChild( domNode );
}

function get( tag, parent ) {
	return ( parent || documentElement ).getElementsByTagName( tag );
}

documentElement = get( "head" )[ 0 ] || documentElement;
