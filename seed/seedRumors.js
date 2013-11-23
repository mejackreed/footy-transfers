var db = require('../app/models/db');
var Rumor = require('../app/models/rumor');
var _ = require('../node_modules/lodash'),
  async = require('../node_modules/async');

var rumors = require('./rumorFile');



async.series({
    one: function(callback) {
      Rumor.collection.remove(function(err) {
        callback(null, 1);
      })
    },
    two: function(callback) {
      _.each(rumors, function(val, i) {
        var test = new Rumor({
          playerName: val.Player,
          date: val.Date,
          movingFrom: val['Moving from'],
          movingTo: val['Moving to'],
          fee: val.Fee,
          source: val.Source,
          detail: val.Detail
        }).save(function(err) {
          callback(null, 2);
        })
      })

    }
  },
  function(err, results) {
    db.connection.close()

  });