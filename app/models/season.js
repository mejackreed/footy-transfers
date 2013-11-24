var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var Result = require('./result');

var SeasonSchema = new Schema({
  leagueName: {
    type: String,
    index: true
  },
  startYear: {
    type: String
  },
  endYear: {
    type: String
  },
  clubResults : []
});

module.exports = mongoose.model('Season', SeasonSchema);