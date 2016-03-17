var util = require('util');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var jsdom = require('jsdom');
var ProgressBar = require('progress');
var jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.min.js", "utf-8");

var relPath = './';

if (process.cwd().indexOf('crawl') > -1) {
	relPath = '../';
}

var dataFile = relPath + 'data/xkcd-index.json';
var indexFile = relPath + 'data/xkcd';

var Parser = require('./parse-stream');
var Output = require('./output-stream');
var Datastore = require('nedb'),
	db = new Datastore({ filename: indexFile, autoload: true });

var bar;

db.ensureIndex({ fieldName: 'word', unique: true  }, function (err) {
	// If there was an error, err is not null
	if (err) throw err;
});

var parseStream = new Parser({objectMode: true, dataFile: dataFile});
var outputStream = new Output({objectMode: true, dataFile: dataFile, db: db });
parseStream.pipe(outputStream);


var removeFromJobregistry = function (i, job) {
	var index = job.registry.indexOf(i);
	job.registry.splice(index, 1);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getRandomSec = function () {
	return getRandomInt(3,8) * 1000;
}

function parse (i, job, errors, window) {

	if (errors) {
		console.log(errors);
		setTimeout(fetch.bind(null, i, job), getRandomSec());
		return;
	}

	var $ = window.$;

	var elements = $('#Transcript').parent().nextAll('dl');
	var title = $('#firstHeading').text().replace(/\d*:/g, '');
	var text = title + ' ' + elements.text();

	parseStream.write({
		id: i,
		data: text,
		job: job
	});

	removeFromJobregistry(i, job);

	bar.tick(1);

	if (job.registry.length == 0) {
		parseStream.end();
	}
}

function start (job) {

	bar = new ProgressBar([
		'parsing xkcd wisdom: from', job.from, 'to', job.to,' [:bar] :percent'
	].join(' '), {
		complete: '=',
		incomplete: ' ',
		width: 20,
		total: (job.to + 1 - job.from)
	});

	bar.tick(0);

	for (var i = job.from; i <= job.to ; i++) {
		job.registry.push(i);
		setTimeout(fetch.bind(null, i, job), getRandomSec());
	}

	outputStream.on('finish', function () {
		db.persistence.compactDatafile();

		fs.writeFile(dataFile, JSON.stringify({
			latest: argv.to
		}));
		console.log('done!');
	});
}

function fetch (i, job) {
	jsdom.env({
		url: "http://www.explainxkcd.com/wiki/index.php/" + i,
		src: [jquery],
		done: parse.bind(null, i, job)
	});
}

fs.readFile(dataFile, function (err, file) {
	if (err) throw err;

	var data = JSON.parse(file);

	var job = {
		from: data.latest,
		to: argv.to,
		registry: []
	}

	if (!argv.to) {
		console.log('Error: "to" parameter is mandantory');
		return;
	}

	start(job);

});