<!DOCTYPE html>
<html>
<head>
	<title>usejs Test Suite</title>
	<link rel="Stylesheet" media="screen" href="qunit/qunit/qunit.css" /><?php
	
	$files = array( "init.js" );
	
	$src = isset( $_GET[ "dist" ] ) ? "dist" : ( isset( $_GET[ "min" ] ) ? "min" : "src" );
	
	switch( $src ) {
		case "src":
			array_push( $files, "../build/data/intro.js" );
			$modules = json_decode( file_get_contents( "../build/data/modules.json" ), true );
			foreach( $modules as $module => $_ ) {
				array_push( $files, "../src/$module.js" );
			}
			array_push( $files, "../build/data/outro.js" );
			break;
		case "min":
			array_push( $files, "../dist/use.min.js" );
			break;
		case "dist":
			array_push( $files, "../dist/use.js" );
			break;
	}
	
	array_push( $files, "qunit/qunit/qunit.js" );
	$units = json_decode( file_get_contents( "./units.json" ), true );
	foreach( $units as $unit => $_ ) {
		array_push( $files, "unit/$unit.js" );
	}
	
	echo "\n<script>/*<!-- $src */\n";
	foreach( $files as $file ) {
		echo file_get_contents( $file );
		echo "\n";
	}
	echo "/* $src -->*/</script>";
	
?></head>
<body id="body">
	<h1 id="qunit-header"><a href="./index.php">usejs Test Suite</a></h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<div id="qunit-fixture"></div>
</body>
</html>
