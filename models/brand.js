var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {

    var brandSchema = new Schema({
      name: String,
      website: String,
      updated: { type: Date, default: Date.now }
      
      // TODO: add type of brand (boards, shoes, magazine, wheels, etc...)
    });

    mongoose.model("Brand", brandSchema);
};