var Club = require('../models/club'),
	Player = require('../models/player'),
	Transfer = require('../models/transfer')
	var db = require('../models/db');

var _ = require('lodash');



exports.setup = function(app) {
	var api = new ApiController();

	app.get('/api/clubs', api.clubs);
	app.get('/api/clubs/:name', api.clubs);
	app.get('/api/leagues', api.leagues);
	app.get('/api/leagues/:league', api.leagues);
	app.get('/api/players', api.players);
	app.get('/api/players/nation/:nation', api.players);
	app.get('/api/transfers/to/:league', api.transfers('to'));
	app.get('/api/transfers/from/:league', api.transfers('from'));
	app.get('/api/transfers', api.transfers);

};

function ApiController() {
	console.log('api controller initialized');
}

ApiController.prototype.clubs = function(req, res) {
	// res.json({test:"test123"})
	if (req.params.name) {
		Club.find({
			name: req.params.name
		}).exec(function(err, doc) {
			res.json(doc)
		})
	} else {
		Club.find().exec(function(err, doc) {
			res.json(doc)
		})
	}
};

ApiController.prototype.leagues = function(req, res) {
	if (req.params.league) {
		Club.find({
			league: req.params.league
		}).exec(function(err, doc) {
			res.json(doc)
		})
	} else {
		Club.find().distinct('league').exec(function(err, doc) {
			res.json(doc)
		})
	}
}

// ApiController.prototype.transfers = function(req, res) {
// 	if (req.params.league) {
// 		Club.find({
// 			league: req.params.league
// 		}).exec(function(err, doc) {
// 			res.json(doc)
// 		})
// 	}
// 	Transfer.find().populate('player').exec(function(err, doc) {
// 		res.json(doc)
// 	})
// }

ApiController.prototype.transfers = function(type) {
	return function(req, res, next) {
		switch (type) {
			case 'to':
				Club.find({
					league: req.params.league
				}).exec(function(err, clubs) {
					var clubids = [];
					_.each(clubs, function(val) {
						clubids.push(val._id);
					});
					Transfer.find({
						'transferToClub': {
							$in: clubids
						},
						'transferDate': {
							"$gte": new Date(2000, 01, 01)
						}
					}).populate('player transferToClub transferFromClub').exec(function(err, doc) {
						res.json(doc);
					});
				});
				break;
			case 'from':
				Club.find({
					league: req.params.league
				}).exec(function(err, clubs) {
					var clubids = [];
					_.each(clubs, function(val) {
						clubids.push(val._id);
					});
					Transfer.find({
						'transferFromClub': {
							$in: clubids
						},
						'transferDate': {
							"$gte": new Date(2000, 01, 01)
						}
					}).populate('player transferToClub transferFromClub').exec(function(err, doc) {
						res.json(doc);
					});
				});
				break;
		}
	}
}

ApiController.prototype.players = function(req, res) {
	if (req.params.nation) {
		Player.find({
			nation: req.params.nation
		}).exec(function(err, doc) {
			res.json(doc)
		})
	}
	Player.find().exec(function(err, doc) {
		res.json(doc)
	})
}


// var stuff = new Item({
// 	name: "hello stuff",
// 	equipped: true
// }).save(function(err,doc){
// 	console.log(err,doc)
// })


// Item.find()
// console.log(Item.find().exec())