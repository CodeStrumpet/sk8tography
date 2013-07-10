var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Trick = mongoose.model("Trick");
var Skater = mongoose.model("Skater");

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {
    
    var clipSchema = new Schema({
        videoSegmentId: String,
        index: Number,
        updated: { type: Date, default: Date.now },
        status: { type: Number, default: consts.ClipStatus.ADDED },
        fileFormat: Number,
        startTime: Number,
        duration: Number,
        tricks : [Trick.schema],
        skaterRef : Schema.ObjectId,
        spotRef : Schema.ObjectId,
        thumbFileName : String
    });


    clipSchema.methods.fileName = function() {

      var viddyName = this.videoSegmentId;

      viddyName = viddyName + "_" + this.index + "." + consts.videoFileFormatString(this.fileFormat);

      return viddyName;
    };

    clipSchema.methods.mergeTricks = function(newTricks) {

      // we will simply replace all of the old tricks with new ones

      var replacementTricks = [];

      for (var i = 0; i < newTricks.length; i++) {
        var trick = new Trick(
        {
          stance : newTricks[i].stance,
          trickTypeRef : mongoose.Types.ObjectId(newTricks[i].trickTypeRef),
          terrainType : newTricks[i].terrainType
        });

        replacementTricks.push(trick);
        console.log("replacementTrick: " + trick.trickTypeRef);
      }


      this.tricks = replacementTricks;
    }

    mongoose.model("Clip", clipSchema);
};