'use strict';

var mongoose = require("mongoose");

var uristring = process.env.MONGODB_URI ||
	process.env.MONGOLAB_URI ||
	'mongodb://localhost/footballviz';

exports.uristring = uristring;

var mongoOptions = {
	db: {
		safe: true
	}
};

var db = mongoose.connect(uristring, mongoOptions, function(err) {
	if (err) {
	console.log('ERROR connecting to: ' + uristring + '. ' + err);
	} else {
	console.log('Succeeded connected to: ' + uristring);
	}
});

module.exports = db;