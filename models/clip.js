var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {


    
    var clipSchema = new Schema({
      videoId: Schema.Types.ObjectId,
      index: Number,
      updated: { type: Date, default: Date.now },
      status: { type: Number, default: consts.ClipStatus.ADDED,
      fileFormat: Number }
    });


    clipSchema.methods.fileName = function() {

      var viddyName = this.videoId;

      viddyName = viddyName + "_" + this.index + "." + consts.videoFileFormatString(this.fileFormat);

      return viddyName;
    };
