var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var TransferSchema = new Schema({
  transferToClub: {
    type: Schema.Types.ObjectId,
    ref: 'Club'
  },
  transferFromClub: {
    type: Schema.Types.ObjectId,
    ref: 'Club'
  },
  player: {
    type: Schema.Types.ObjectId,
    ref: 'Player'
  },
  fee: {
    type: String
  },
  transferDate: {
    type: Date,
    required: false
  }
});

module.exports = mongoose.model('Transfer', TransferSchema);