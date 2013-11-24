var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var Result = require('./result');

var SeasonSchema = new Schema({
  leagueName: {
    type: String,
    index: true
  },
  startYear: {
    type: Number
  },
  endYear: {
    type: Number
  },
  clubResults: [{
    type: Schema.Types.ObjectId,
    ref: 'Result'
  }]
});

module.exports = mongoose.model('Season', SeasonSchema);