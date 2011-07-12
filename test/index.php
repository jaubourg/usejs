<?php

	function loadScripts( $scripts ) {
		echo "\n<script>/*<!--*/\n";
		foreach( $scripts as $script ) {
			echo file_get_contents( $script );
			echo "\n";
		}
		echo "/*-->*/</script>";
	}

?><!DOCTYPE html>
<html>
<head>
	<title>UseJS Test Suite</title>
	<link rel="Stylesheet" media="screen" href="qunit/qunit/qunit.css" /><?php
	
	$modules = json_decode( file_get_contents( "../build/data/modules.json" ), true );
	$files = array( "../build/data/intro.js" );
	foreach( $modules as $module => $_ ) {
		array_push( $files, "../src/$module.js" );
	}
	array_push( $files, "../build/data/outro.js", "qunit/qunit/qunit.js" );
	$modules = json_decode( file_get_contents( "./units.json" ), true );
	foreach( $modules as $module => $_ ) {
		array_push( $files, "unit/$module.js" );
	}
	loadScripts( $files );

?></head>
<body id="body">
	<h1 id="qunit-header"><a href="./index.php">UseJS Test Suite</a></h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<div id="qunit-fixture"></div>
</body>
</html>
