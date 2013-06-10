var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {


    
    var videoSchema = new Schema({
      url: 'String',
      status: 'Number',
      source: 'Number',
      fileFormat: 'Number',
      sourceTitle: 'String',
      sourceDesc: 'String',
      sourceSquareThumb: "String",
      sourceLargeThumb: "String",
      sourceDuration: "Number",
      sourceViewCount: "Number",
      sourceUploader: "String"
    });


    videoSchema.methods.fileName = function() {


      var viddyName = this.sourceId();

      if (viddyName == null) {
        viddyName = consts.hashCode(this.url);
      }

      viddyName = viddyName + "." + consts.videoFileFormatString(this.fileFormat);

      return viddyName;
    };

    videoSchema.methods.sourceId = function() {

      var urlParse = require('url');
      var parsedURL = urlParse.parse(this.url, true);
      
      if (this.source == consts.VideoSource.YOUTUBE) {
        return parsedURL.query.v;
      } else if (this.source == consts.VideoSource.VIMEO) {
        var pathArray = parsedURL.pathName.split('/');
        return pathArray[0];
      } else {
        return null;
      }
    }

    mongoose.model("Video", videoSchema);
};