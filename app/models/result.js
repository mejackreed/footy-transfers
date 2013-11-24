var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var ResultSchema = new Schema({
  club: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: false
  },
  draw: {
    type: Number
  },
  win: {
    type: Number
  },
  rank: {
    type: Number
  },
  points: {
    type: Number
  },
  loss: {
    type: Number
  },
  goalsAgainst: {
    type: Number
  },
  goalsFor: {
    type: Number
  },
});

module.exports = mongoose.model('Result', ResultSchema);
