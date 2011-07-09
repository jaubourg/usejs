<!DOCTYPE html>
<html>
<head>
	<title>UseJS Test Suite</title>
	<link rel="Stylesheet" media="screen" href="qunit/qunit/qunit.css" />
	<?php
		$modules = json_decode( file_get_contents( "../build/data/modules.json" ), true );
		foreach( $modules as $module => $_ ) {
			?><script src="../src/<?= $module ?>.js"></script><?php
		}
	?>
	<script src="qunit/qunit/qunit.js"></script>
	<?php
		$noUnit = array( "vars", "load_module" );
		foreach( $modules as $module => $_ ) {
			if ( !in_array( $module, $noUnit ) ) {
			?><script src="unit/<?= $module ?>.js"></script><?php
			}
		}
	?>
</head>
<body id="body">
	<h1 id="qunit-header"><a href="./index.html">UseJS Test Suite</a></h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<div id="qunit-fixture"></div>
</body>
</html>
