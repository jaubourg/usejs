// Creates the main use object
var tmp = useFactory( resolveURL, Future() );

// Exposes it as a global
window.use = tmp.u;

// Calls the release callback later
// so that use.done is called for the main module
later( tmp.r );
