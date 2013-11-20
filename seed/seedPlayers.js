var db = require('../app/models/db');
var Club = require('../app/models/club'),
	Player = require('../app/models/player'),
	Transfer = require('../app/models/transfer');
var _ = require('../node_modules/lodash');
var moment = require('../node_modules/moment');
var async = require('../node_modules/async');

var players = _.union(require('./playerInfo1'), require('./playerInfo2'), require('./playerInfo3'), require('./playerInfo4'), require('./playerInfo5'), require('./playerInfo6'), require('./playerInfo7'));

// console.log(db)

function createTransfers(player, playerID) {
	// console.log(player.transfers.length)
	if (player.transfers.length > 0) {
		_.each(player.transfers, function(val, i) {
			var toID, fromID
				async.series({
						one: function(callback) {
							Club.find({
								oldId: val.toID
							}).select('clubId').exec(function(err, doc) {
								toID = doc[0]
								callback(null, 1)
							})
						},
						two: function(callback) {
							Club.find({
								oldId: val.fromID
							}).select('clubId').exec(function(err, doc) {
								fromID = doc[0]
								callback(null, 2)
							})
						}
					},
					function(err, results) {
						var newTransfer = new Transfer({
							transferToClub: toID._id,
							transferFromClub: fromID._id,
							player: playerID,
							fee: val.fee,
							transferDate: getDate(val.date)
						})
						newTransfer.save(function(err, doc) {
							console.log('transfer saved')


						})
						// db.connection.close();
					});

		})
	} else {
		return
	}
}


function getDate(val) {
	if (val.length > 0) {
		return moment(val, 'DD-MM-YYYY');
	} else {
		return null;
	}
}

async.series({
		one: function(callback) {
			Player.collection.remove(function(err) {
				Transfer.collection.remove(function(err) {
					callback(null, 1);
				});
			});

		},
		two: function(callback) {
			_.each(players, function(val, i) {
				// console.log(val.playerName)
				var dob = getDate(val.dateOfBirth)
				Club.find({
					oldId: val.currentClubID
				}).select('clubId').exec(function(err, doc) {
					if (doc.length > 0) {
						var newPlayer = new Player({
							name: val.playerName,
							nation: val.nation,
							oldId: val.PlayerID,
							currentClub: doc[0],
							dateOfBirth: getDate(val.dateOfBirth),
							position: val.position
						}).save(function(err, doc) {
							createTransfers(val, doc._id)
							// console.log(doc._id)
							// callback(null, 2)
						})
					} else {
						var newPlayer = new Player({
							name: val.playerName,
							nation: val.nation,
							oldId: val.PlayerID,
							dateOfBirth: dob,
							position: val.position
						}).save(function(err, doc) {
							createTransfers(val, doc._id)
							// console.log(err)
							// callback(val, doc._id)
						})
					}
				})
			});
		},
		three: function(callback) {
			// createTransfers(val, doc.id)
			// console.log(callback)
			callback(null, 3)
		}
	},
	function(err, results) {
		console.log(players.length)
		db.connection.close()

	});


// var test = new Club({
//   name: val.name,
//   league: val.league,
//   oldId: val.teamID 
// }).save(function(err){
//   if (err) console.log(err);
// })