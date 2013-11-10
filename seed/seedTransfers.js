var db = require('../app/models/db');
var Club = require('../app/models/club'),
	Player = require('../app/models/player'),
	Transfer = require('../app/models/transfer');
var _ = require('../node_modules/lodash');
var moment = require('../node_modules/moment');
var async = require('../node_modules/async');


Transfer.find().exec(function(err, doc) {
		_.each(doc, function(val, i) {
				// console.log(val)
				if (val._id) {
					Player.update({
						_id: val.playerId
					}, {
						$addToSet: {
							transfers: val._id
						}
					}, {
						upsert: true
					}, function(err,doc) {
						console.log(err, doc)
						// console.log('transfer saved!')
					});
				}
		});
});