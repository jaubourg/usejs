usejs
=====

__usejs__ is a simple _module_ loader and dependency manager for the browser. It provides sandboxing of _modules_ and the means to transform any script into a __usejs__ module.

__usejs__ weights only 1.76kB when minified gzipped and is dual-licensed under the MIT or GPL Version 2 licenses.

# Usage

## Loading the Library

Yep, even a loader has to be loaded. Simply point a script tag to where the __usejs__ script is located:

```html
<!-- minified version -->
<script src="path/to/script/use.X.Y.Z.min.js"></script>

<!-- non-minified version -->
<script src="path/to/script/use.X.Y.Z.js"></script>
```
where X.Y.Z is the version you wish to use.

## Your First Module

Nothing speaks like a simple example. So let's say you have a file called __simple.js__ as follows:

```javascript
var myVar;

expose({
    get: function() {
        return myVar;
    },
    set: function( value ) {
        myVar = value;
    }
});
```
You'd load __simple.js__ by adding the following code into an inline script block in your main HTML page:

```javascript
require( "path/to/script/simple.js", function( simple ) {
    console.log( simple.get() ); // will output "undefined"
    simple.set( "hello world" );
    console.log( simple.get() ); // will output "hello world"
    console.log( window.myVar ); // will output "undefined"
});
```
Everything is pretty straight-forward; _require_ will load the files which URLs have been provided then, when they completed their execution, will call the callback with the _modules_ as arguments.

A _module_ is just the collection of methods and attributes that have been exposed using _expose_.

The final line of the callback in the last snippet needs some explaining: despite _myVar_ being declared globally in __simple.js__, it is not available as a global variable in the main HTML file. That's because, in __usejs__, _modules_ are _sandboxed_. Note that the _sandboxing_ doesn't involve any wrapping around the _module_'s code so it will work cross-domain!

Now, let's say you do the following later in your page:

```javascript
require( "http://mydomain/path/to/script/simple.js", function( simple ) {
    console.log( simple.get() ); // will output "hello world"
});
```
The exact same _module_ is given to this second callback. This works because __usejs__ caches _modules_ and is able to recognize when the same _module_ is required even when mixing absolute and relative URLs.

You can also use a hash in the URL passed to require in order to extract a specific element from a module:

```javascript
require( "path/to/script/simple.js#get", function( get ) {
    console.log( get() ); // will output "hello world"
});
```
## Aliasing

Writing URLs can be tedious at times, but __usejs__ provides an aliasing system.

```javascript
define.alias( "simple", "path/to/script/simple.js" );

require( "simple", function( simple ) {
    console.log( simple.get() ); // will output "hello world"
});
```
You can also use the hash technique seen earlier to make an alias targetting a specific element in a module:

```javascript
define.alias( "simple.get", "path/to/script/simple.js#get" );

require( "simple.get", function( get ) {
    console.log( get() ); // will output "hello world"
});
```
Be careful, though, since, as of today, aliases are declared globally and are accessible by all modules. This may change in the future.

Aliases are non-recursive. So the following will not work:

```javascript
define.alias( "simple.get", "simple#get" );

require( "simple.get", function() {
    // will never be called since "./simple" does not exist
});
```
Also, redefining an alias will erase any previous value:

```javascript
define.alias( "simple.get", "someFile.js#get" );
define.alias( "simple.get", "path/to/simple.js#get" );

require( "simple.get", function( simple ) {
    console.log( get() ); // will output "hello world"
});
```

## In-Module Dependencies and Relative URLs

Now, let's say you have another _module_, __dependent.js__ which is located in the same directory as __simple.js__:

```javascript
require( "simple.js#get", function( get ) {
    expose({
        show: function() {
            console.log( get() );
        }
    });
});
```
First of all, __simple.js__ is required using a URL relative to __dependent.js__. __usejs__ always knows in which path context the current module is and will resolve URLs accordingly.

Then note that we _expose_ the _show_ method only when __simple.js__ is loaded. __usejs__ will keep track of outbound requirements and wait for them to complete before it considers it loaded. So everything will work as expected if you add the following code to your page:

```javascript
require( "path/to/script/dependent.js", function( dependent ) {
    dependent.show(); // will output "hello world"
});
```
Furthermore, since _require_ can accept any number of requirements, we could do the following:

```javascript
require( "path/to/script/dependent.js", "path/to/script/simple.js", function( dependent, simple ) {
    simple.set( "... and good-bye!" );
    dependent.show(); // will output "... and good bye!"
});
```
## Beyond Expose

Sometimes, it can be handy for a module to be something more than just a plain object, like a function for instance.

Let's create a __function.js__ module that does just that:

```javascript
module(function() {
    return module()._data;
});

expose({
    _data: "hello world";
});
```
The _module_ function will return the module as it's currently set. If a non-_null_, non-_undefined_ value is passed to it, then the _module_ is set to this value. In our example, we set the _module_ to a function then add the _\_data_ attribute onto it. We can then use __function.js__ as follows:

```javascript
require( "path/to/script/function.js", function( func ) {
    console.log( func() ); // will output "hello world"
});
```

## Turning any Script into a Module

Often, you'll need to load scripts that are __not__ _modules_. Thankfully, __usejs__ provides a means to transform any script into a _module_. For instance, here is how you would transform _jQuery_ into a __usejs__ _module_:

```javascript
define.script( "path/to/script/jQuery.js", function() {
    if ( window.jQuery ) {
        this.module( window.jQuery.noConflict( true ) );
    } else {
        throw "cannot load jQuery";
    }
});
```
The callback is called when the script has been loaded. Obviously, such a script is always loaded within the main HTML document so that it has access to the main global window. Inside of the callback, _this_ provides the usual _define_, _require_, _expose_ and _module_ methods and everything will work as if you were in your usual module sandbox.

Within the callback, URLs are resolved relatively to the path of the page/_module_ where the define.script statement is located, __not__ relatively to the directory into which the script being treated is located. This is something we'd like to change in the future.

Note that redefining a script to _module_ bridge will erase the previous one. We intend to make this a bit more flexible in the future.

Using _define.script_ will just let __usejs__ know that the script needs extra-care: you still have to _require_ the _jQuery_ script for it to be actually loaded:

```javascript
require( "path/to/script/jQuery.js", function( $ ) {
    $( "head title" ).text( "jQuery loaded" ); // Will change the page title to "jQuery loaded"
});
```

## Globals

OK, globals are __evil__. Yet, they are sometimes unavoidable, especially when loading interdependent scripts that are not modules (like a _jQuery_ plugin). Here is how we can enhance our _jQuery_ adapter to make the _jQuery_ object global:

```javascript
define.script( "path/to/script/jQuery.js", function() {
    if ( window.jQuery ) {
        globals.add( this.module( window.jQuery.noConflict( true ) ) );
    } else {
        throw "cannot load jQuery";
    }
});
```
Global properties will be available to all _modules_, already loaded, loading or not yet loaded. Be mindful of potentially harmful collisions with globally declared variables in your _modules_. __Evil__, I tell you.

Also, if you wish to propagate changes to a global throughout all _modules_, you _have to_ set it using the _globals_ function again.

# Future Developments

__usejs__ is heavyweight and not at all optimized yet. We're investigating alternatives to iframes for sandboxing _modules_.

However, the library should be usable as is. It obviously needs some tweaking and more thourough unit testing. But what it needs most is __you__. Toy with it, test it to its limits then report bugs or, even better, propose pull requests!

Features we intend to add in the future:

* a generic means to "hold" a _module_ while some asynchronous action is occuring
* the possibility to load a script without having it defined as a module (very useful for libraries plugins)
* a means to "add" to a define.script statement later on (also for libraries plugins)
* resolve URLs relatively to the script's directory in a _define.script_ callback
* provide a build tool to create a single, minified, JavaScript file for production use
