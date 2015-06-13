var util = require('util');
var fs = require('fs');

var Writable = require('stream').Writable;
util.inherits(Output, Writable);

function Output (opt) {
	Writable.call(this, opt);
	this.db = opt.db;
}

function defCallback (xkcdID, err) {
	if (!err) return;

	if (err.errorType === 'uniqueViolated') {
		this.db.update(
			{ word: err.key },
			{ $push: { entries: xkcdID } },
			{},
			defCallback.bind(this, xkcdID)
		);
	} else {
		console.log(err );
		throw err;
	}
}

Output.prototype._write = function (data, encoding, callback) {

	var that = this;

	var xkcdID = data.id;

	data.data.map(function (word) {
		that.db.find({ word: word }, function (err, docs) {
			if (err) throw err;

			if (docs.length < 1) {
				that.db.insert(
					{
						word: word,
						entries: [xkcdID]
					},
					defCallback.bind(that, xkcdID)
				);
			} else {
				that.db.update(
					{ word: word },
					{ $push: { entries: xkcdID } },
					{},
					defCallback.bind(that, xkcdID)
				);
			}
		});
	});

	callback(null);
}


module.exports = Output;