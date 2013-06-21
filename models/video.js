var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {

    var videoSchema = new Schema({
      name: String,
      brandRef: Schema.Types.ObjectId,
      year: Number,
      infoUrl: String,
      purchaseUrl: String,
      updated: { type: Date, default: Date.now }
    });

    mongoose.model("Video", videoSchema);
};