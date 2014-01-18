usejs
=====

__usejs__ is a simple _module_ loader and dependency manager for the browser. It provides sandboxing of _modules_ and the means to transform any script into a __usejs__ module.

__usejs__ weights only 1.48kB when minified gzipped and is released under the MIT license.

__usejs__ has been tested in Internet Explorer (6 to 9), Chrome (latest), Firefox 5, Opera (latest) and Safari (latest).

# Getting the library

## Build the library

* Clone this repository
* Make sure you have nodejs installed
* Enter the usejs directory and type `node .`

## Load the Library

Yep, even a loader has to be loaded. Simply point a script tag to where the __usejs__ script is located:

```html
<!-- minified version -->
<script src="path/to/script/use.min.js"></script>

<!-- non-minified version -->
<script src="path/to/script/use.js"></script>
```

# Usage

## Your First Module

Nothing speaks like a simple example. So let's say you have a file called __simple.js__ as follows:

```javascript
var myVar;

use.expose({
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
use( "path/to/script/simple.js", function( simple ) {
    console.log( simple.get() ); // will output "undefined"
    simple.set( "hello world" );
    console.log( simple.get() ); // will output "hello world"
    console.log( window.myVar ); // will output "undefined"
});
```
Everything is pretty straight-forward; _use_ will load the files which URLs have been provided then, when they completed their execution, will call the callback with the _modules_ as arguments.

A _module_ is just the collection of methods and attributes that have been exposed using _use.expose_.

The final line of the callback in the last snippet needs some explaining: despite _myVar_ being declared globally in __simple.js__, it is not available as a global variable in the main HTML file. That's because, in __usejs__, _modules_ are _sandboxed_. Note that _sandboxing_ doesn't involve any wrapper around the _module_'s code so it will work cross-domain!

Now, let's say you do the following later in your page:

```javascript
use( "http://mydomain/path/to/script/simple.js", function( simple ) {
    console.log( simple.get() ); // will output "hello world"
});
```
The exact same _module_ is given to this second callback. This works because __usejs__ caches _modules_ and is able to recognize when the same _module_ is required even when mixing absolute and relative URLs.

You can also use a hash in the URL passed to _use_ in order to extract a specific element from a module:

```javascript
use( "path/to/script/simple.js#get", function( get ) {
    console.log( get() ); // will output "hello world"
});
```

## In-Module Dependencies and Relative URLs

Now, let's say you have another _module_, __dependent.js__ which is located in the same directory as __simple.js__:

```javascript
use( "simple.js#get", function( get ) {
    use.expose({
        show: function() {
            console.log( get() );
        }
    });
});
```
First of all, __simple.js__ is required using a URL relative to __dependent.js__. __usejs__ always knows in which path context the current module is and will resolve URLs accordingly.

Then note that we _expose_ the _show_ method only when __simple.js__ is loaded. __usejs__ will keep track of outbound requirements and wait for them to complete before it considers it loaded. So everything will work as expected if you add the following code to your page:

```javascript
use( "path/to/script/dependent.js", function( dependent ) {
    dependent.show(); // will output "hello world"
});
```
Furthermore, since _use_ can accept any number of requirements, we could do the following:

```javascript
use( "path/to/script/dependent.js", "path/to/script/simple.js", function( dependent, simple ) {
    simple.set( "... and good-bye!" );
    dependent.show(); // will output "... and good bye!"
});
```
## Beyond Expose

Sometimes, it can be handy for a module to be something more than just a plain object, like a function for instance.

Let's create a __function.js__ module that does just that:

```javascript
use.module(function() {
    return use.module()._data;
});

use.expose({
    _data: "hello world";
});
```
The _use.module_ function will return the module as it's currently set. If a non-_null_, non-_undefined_ value is given, then the _module_ is set to this value. In our example, we set the _module_ to a function then add the _\_data_ attribute onto it. We can then use __function.js__ as follows:

```javascript
use( "path/to/script/function.js", function( func ) {
    console.log( func() ); // will output "hello world"
});
```

## Turning any Script into a Module

Often, you'll need to load scripts that are __not__ _modules_. Thankfully, __usejs__ provides a means to transform any script into a _module_. For instance, here is how you would transform _jQuery_ into a __usejs__ _module_:

```javascript
use.bridge( "path/to/script/jQuery.js", function( use ) {
    if ( window.jQuery ) {
        use.module( window.jQuery.noConflict( true ) );
    } else {
        throw "cannot load jQuery";
    }
});
```
The callback is called when the script has been loaded. Obviously, such a script is always loaded within the main HTML document so that it has access to the main global window. Inside of the callback, the _use_ provided as the single parameter will work as if you were in your usual module sandbox. Context (_this_) of the callback is the global object for said _module_.

Within the callback, URLs are resolved relatively to the path of the page and/or _module_ where the _use.bridge_ statement is located, __not__ relatively to the directory into which the script being treated is located.

Note that redefining a script to _module_ bridge will erase the previous one.

Using _use.bridge_ will just let __usejs__ know that the script needs extra-care: you still have to _use_ the _jQuery_ script for it to be actually loaded:

```javascript
use( "path/to/script/jQuery.js", function( $ ) {
    $( "head title" ).text( "jQuery loaded" ); // Will change the page title to "jQuery loaded"
});
```

## Random asynchronous operations

Sometimes, you wish to wait for an asychronous operation to finish before tagging the module as loaded. For instance, you may need to read a json configuration over the network. Here is how to proceed:

```javascript
use.hold(function( release ) {
    use( "path/to/script/jQuery.js", function( $ ) {
        $.getJSON( "path/to/mydata.json" ).done(function( data ) {
            // Expose whatever you need to expose
            release();
        });
    });
});
```

_use.hold_ accepts a single callback as a parameter. This callback will get passed a _release_ function to be called when the asynchronous operation is finished: as simple as that!

## Routing

One thing __usejs__ is particularly good at is URL resolution and aliasing.

Say you're developping your application and use a non-minified version of your module:

```javascript
use( "path/to/my/module.js", function( module ) {
   // ...
});
```

Now you want to switch to the minified version in production, but the _module_ is used in a lot of different other modules and you don't feel like going through all of them to rewrite the url. You could do something like this: 

```javascript
use.route( "path/to/my/module.js", "path/to/my/module.min.js" );
```

Now, whenever __module.js__ is used, it's actually __module.min.js__ that'll be used.

Sometimes, you need to refactor _modules_ and one can become a sub-element of yet a bigger _module_ in the process, it's pretty easy to let __usejs__ know:

```javascript
use.route( "path/to/my/module.js", "path/to/my/module/biggerModule.js#module" );
```

You can even point to _fields_ in the _module_ as if it was in its own file: 

```javascript
use( "path/to/my/module.js#field", function( module ) {
    // ...
});
// is equivalent to
use( "path/to/my/module/biggerModule.js#module.field" );
    // ...
});
```

Even better: what if you're waiting for a colleague to deliver a _module_ yet need a _mockup_ to test your application __now__. Usually, you'd have to create a new file and deal with replacing it when the real _module_ is finally delivered. In __usejs__, you could use routing in the same fashion you would _use.bridge_:

```javascript
use.route( "path/to/my/nonExistingModule.js", function( use ) {
   // use, expose, hold, whatever you need
});
```

After this definition, you can use __nonExistingModule.js__ as if it was an actual file.

All of this is fine, but what if you need to reference to a _module_ globally so that, given a convention, _modules_ of different domains may still refer to the same thing without lengthy, absolute, unreadable and unflexible paths?

Well, routes are just URLs but they're not limited to existing protocols, so you can easily use custom protocols as you see fit:

```javascript
use.route( "jquery:core", "path/to/script/jQuery.js" );
use.route( "namespace:path/to/element", "http://myDomain/path/to/actual/module.js" );
```

No matter the domain or path it's in, the following statement will always load the same file:

```javascript
use( "namespace:path/to/element", function( alwaysAsConfigured ) {
	// ...
});
```

## Utilities

First of all, _use_ and all its methods are chainable, so the following will work:

```javascript
use.bridge( "path/to/script/jQuery.js", function( use ) {
    if ( window.jQuery ) {
        use.module( window.jQuery.noConflict( true ) );
    } else {
        throw "cannot load jQuery";
    }
}).route( "jquery:core", "path/to/script/jQuery.js" );
```

Then _use_ exposes two utility methods:

* _use.type_ which returns the type of the given argument (akin to _jQuery.type_)
* _use.resolve_ which resolves the URL according to the context (ie. the path of the _module_ it's called from)

# Future Developments

The library should be usable as is. It obviously needs some tweaking and more thorough unit testing. But what it needs most is __you__. Toy with it, test it to its limits then report bugs or, even better, propose pull requests!

Features we intend to add in the future:

* an easy way to create plugins (_use.hold_ makes it easy to define blocking asynchronous tasks, we just need a hook in __usejs__)
* the possibility to load a script without having it defined as a module (very useful for legacy libraries)
* provide a build tool to merge as much dependencies as possible as an initial, minified, JavaScript file for production use.
