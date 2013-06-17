var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var skaterSchema = new Schema({
    name : String,
    isGoofy : Boolean,
  });

  mongoose.model("Skater", skaterSchema);
};