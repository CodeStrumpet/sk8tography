var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {

  var videoSegmentSchema = new Schema({
    _id: String,
    videoRef: Schema.Types.ObjectId,
    url: String,
    status: Number,
    source: Number,
    fileFormat: Number,
    sourceTitle: String,
    sourceDesc: String,
    sourceSquareThumb: String,
    sourceLargeThumb: String,
    sourceDuration: Number,
    sourceViewCount: Number,
    sourceUploader: String,
    updated: { type: Date, default: Date.now },
    extraInfo : {type: Schema.Types.Mixed, default : {}}
  });


  videoSegmentSchema.methods.fileName = function() {

    var viddyName = this._id;

    if (viddyName == null) {
      viddyName = consts.hashCode(this.url);
    }

    viddyName = viddyName + "." + consts.videoFileFormatString(this.fileFormat);

    return viddyName;
  };

  mongoose.model("VideoSegment", videoSegmentSchema);
};