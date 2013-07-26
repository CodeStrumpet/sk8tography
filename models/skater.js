var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var skaterSchema = new Schema({
    name : String,
    isGoofy : Boolean,
    thumbFileName: String
  });

  mongoose.model("Skater", skaterSchema);
};