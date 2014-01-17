module( "type" );

test("type", function() {
	expect(18);

	equal( use.type(null), "null", "null" );
	equal( use.type(undefined), "undefined", "undefined" );
	equal( use.type(true), "boolean", "Boolean" );
	equal( use.type(false), "boolean", "Boolean" );
	equal( use.type(Boolean(true)), "boolean", "Boolean" );
	equal( use.type(0), "number", "Number" );
	equal( use.type(1), "number", "Number" );
	equal( use.type(Number(1)), "number", "Number" );
	equal( use.type(""), "string", "String" );
	equal( use.type("a"), "string", "String" );
	equal( use.type(String("a")), "string", "String" );
	equal( use.type({}), "object", "Object" );
	equal( use.type(/foo/), "regexp", "RegExp" );
	equal( use.type(new RegExp("asdf")), "regexp", "RegExp" );
	equal( use.type([1]), "array", "Array" );
	equal( use.type(new Date()), "date", "Date" );
	equal( use.type(new Function("return;")), "function", "Function" );
	equal( use.type(function(){}), "function", "Function" );
});
