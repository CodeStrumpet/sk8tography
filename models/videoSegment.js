var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {

  var videoSegmentSchema = TaggableObject.schema.extend({
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
    extraInfo : {type: Schema.Types.Mixed, default : {}}
  });

  videoSegmentSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});


  videoSegmentSchema.methods.fileName = function() {

    var viddyName = this._id;

    if (viddyName == null) {
      viddyName = consts.hashCode(this.url);
    }

    viddyName = viddyName + "." + consts.videoFileFormatString(this.fileFormat);

    return viddyName;
  };

  videoSegmentSchema.methods.saveWithBroadcast = function(callback) {
    this.save(function(err) {
      callback(err);

      // broadcast to all the socket clients if there has been no error...
      if (!err) {

        var modelInfo = null;
        if (this.emitted && this.emitted.complete && this.emitted.complete.length > 0) {
          modelInfo = this.emitted.complete[0];
        }

        if (modelInfo) {
          var sockets = require('../routes/modules').sockets;
          sockets.emit("videoSegmentUpdated", {
            "videoSegment" : modelInfo
          });
        }
      }
    });
  };

  mongoose.model("VideoSegment", videoSegmentSchema);
};