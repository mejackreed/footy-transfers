var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var LeagueSchema = new Schema({
  name: {
    type: String,
    index: true
  }
});

module.exports = mongoose.model('League', LeagueSchema);