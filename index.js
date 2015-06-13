var fs = require('fs');
var _ = require('lodash');

var Datastore = require('nedb'),
	db = new Datastore({ filename: './data/xkcd', autoload: true });


module.exports = function (words, callback) {

	db.find({ word: { $in: words } }, function (err, docs) {

		if (err) return callback(err);

		if (!docs.length) {
			callback(null, []);
			return;
		}

		var entries = _.map(docs, 'entries');
		var result = _.intersection.apply(_, entries);

		if (result.length && docs.length == words.length) {
			callback(null, result)
		} else {
			callback(null, [])
		}

	});

}