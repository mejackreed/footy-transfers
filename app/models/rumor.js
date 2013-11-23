var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var RumorSchema = new Schema({
  playerName: {
    type: String
  },
  date: {
    type: Date,
    required: false
  },
  movingFrom: {
    type: String
  },
  movingTo: {
    type: String
  },
  fee: {
    type: String
  },
  source: {
    type: String
  },
  detail: {
    type: String
  }
});

module.exports = mongoose.model('Rumor', RumorSchema);