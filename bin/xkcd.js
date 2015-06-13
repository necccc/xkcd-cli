#! /usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var xkcdcli = require('../index.js');

xkcdcli(argv._, function (err, results) {

	if (err) {
		process.exit(1);
		return;
	}

	results.map(function (res) {
		process.stdout.write('https://xkcd.com/' + res + '/' + '\n');

	});

	process.exit(0)

})