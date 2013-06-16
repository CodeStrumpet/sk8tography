var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {


    
    var clipSchema = new Schema({
        videoId: String,
        index: Number,
        updated: { type: Date, default: Date.now },
        status: { type: Number, default: consts.ClipStatus.ADDED },
        fileFormat: Number,
        startTime: Number,
        duration: Number
    });


    clipSchema.methods.fileName = function() {

      var viddyName = this.videoId;

      viddyName = viddyName + "_" + this.index + "." + consts.videoFileFormatString(this.fileFormat);

      return viddyName;
    };

    mongoose.model("Clip", clipSchema);
};