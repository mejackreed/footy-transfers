var db = require('../app/models/db');
var Club = require('../app/models/club');
var _ = require('../node_modules/lodash'),
  async = require('../node_modules/async');


// var clubs = require('./teamInfo');

var clubs = _.union(require('./teamInfo1'), require('./teamInfo2'));
console.log(clubs);
// console.log(db)
// Club.collection.remove(function(err) {
//   console.log(err)
// })



async.series({
    one: function(callback) {
      Club.collection.remove(function(err) {
        callback(null, 1);
      })
    },
    two: function(callback) {
      _.each(clubs, function(val, i) {
        var test = new Club({
          name: val.name,
          league: val.league,
          oldId: val.teamID,
          crestUrl: val.logo
        }).save(function(err) {
          callback(null, 2);
        })
      })

    }
  },
  function(err, results) {
    db.connection.close()

  });