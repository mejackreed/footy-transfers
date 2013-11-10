var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  name: {
    type: String,
    index: true
  },
  nation: {
    type: String
  },
  playerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  oldId: {
    type: Number,
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  position: {
    type: String
  },
  currentClub: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: false
  },
  transfers: [{
    type: Schema.Types.ObjectId,
    ref: 'Transfer'
  }]

});

module.exports = mongoose.model('Player', PlayerSchema);