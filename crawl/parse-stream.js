var _ = require('lodash');
var util = require('util');

var word_filter_array = [
	'a',
	'an',
	'am',
	'are',
	'and',
	'at',
	'but',
	'can',
	'do',
	'i',
	'if',
	'in',
	'im',
	'is',
	'it',
	'me',
	'of',
	'on',
	'the',
	'to',
	'you',
	's',
	'we',
	'with'
];

function word_filter (input) {
	var output = _.difference(input, word_filter_array)
	output = _.uniq(output);
	return output;
}

var Transform = require('stream').Transform;
util.inherits(Parser, Transform);

function Parser (opt) {
	Transform.call(this, opt);
}

Parser.prototype._transform = function (data, encoding, callback) {

	var text = data.data;

	text = text.replace(/[\[\]\.,-\:!\"\?\(\);]/gm, ' ');
	text = text.replace(/\'/gm, ' ');
	text = text.replace(/ t /gm, ' not ');
	text = text.replace(/\n/gm, ' ');
	text = text.replace(/\t/gm, ' ');
	text = text.replace(/  +/g, ' ');
	text = text.toLocaleLowerCase();

	var textArr = text.split(' ');

	textArr = word_filter(textArr);

	callback(null, {
		id: data.id,
		data: textArr,
		job: data.job
	});
}

module.exports = Parser;