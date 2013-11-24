var db = require('../app/models/db');
var Result = require('../app/models/result');
var Season = require('../app/models/season');
var Club = require('../app/models/club');
var _ = require('../node_modules/lodash'),
  async = require('../node_modules/async');

var results = require('./teamResult');

function getId(res, callback) {
  Club.find({
    oldId: res.clubId
  }).select('clubId').exec(function(err, doc) {
    // console.log(doc[0])
    callback({
      clubId: doc[0],
      win: res.win,
      draw: res.draw,
      loss: res.lose,
      rank: res.rank,
      points: res.points,
      goalsAgainst: res.goalsagainst,
      goalsFor: res.goalsfor
    })
  });
}


async.series({
    one: function(callback) {
      Season.collection.remove(function(err) {
        callback(null, 1);
      })
    },
    two: function(callback) {
      _.each(results, function(val, i) {
        var seaRes = [];
        // console.log(val)
        _.each(val.teamResult, function(res, i) {
          getId(res, function(current){
            seaRes.push(current)
          });
        });

        function checkStuff() {
          if (seaRes.length !== val.teamResult.length) {
            setTimeout(checkStuff, 500);
          } else {
            var years = val.year.split(' ');
            var test = new Season({
              leagueName: val.leagueName,
              startYear: years[0],
              endYear: years[1],
              clubResults: seaRes
            }).save(function(err) {
            });
          }

        }
        checkStuff();
      });

    }
  },
  function(err, results) {
    db.connection.close()

  });