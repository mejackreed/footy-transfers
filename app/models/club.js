var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var ClubSchema = new Schema({
  name: {
    type: String,
    index: true
  },
  clubId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  oldId: {
    type: Number,
    index: true
  },
  league: {
    type: String
  },
  crestUrl: {
    type: String
  }
});

module.exports = mongoose.model('Club', ClubSchema);