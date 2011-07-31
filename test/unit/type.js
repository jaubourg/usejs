module( "type" );

test("type", function() {
	expect(18);

	equals( use.type(null), "null", "null" );
	equals( use.type(undefined), "undefined", "undefined" );
	equals( use.type(true), "boolean", "Boolean" );
	equals( use.type(false), "boolean", "Boolean" );
	equals( use.type(Boolean(true)), "boolean", "Boolean" );
	equals( use.type(0), "number", "Number" );
	equals( use.type(1), "number", "Number" );
	equals( use.type(Number(1)), "number", "Number" );
	equals( use.type(""), "string", "String" );
	equals( use.type("a"), "string", "String" );
	equals( use.type(String("a")), "string", "String" );
	equals( use.type({}), "object", "Object" );
	equals( use.type(/foo/), "regexp", "RegExp" );
	equals( use.type(new RegExp("asdf")), "regexp", "RegExp" );
	equals( use.type([1]), "array", "Array" );
	equals( use.type(new Date()), "date", "Date" );
	equals( use.type(new Function("return;")), "function", "Function" );
	equals( use.type(function(){}), "function", "Function" );
});
