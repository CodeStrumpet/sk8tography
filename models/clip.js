var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Trick = mongoose.model("Trick");
var Skater = mongoose.model("Skater");
var TrickType = mongoose.model("TrickType");

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
        skaterRef : {type: Schema.ObjectId, ref: 'Skater' },
        spotRef : {type: Schema.ObjectId, ref: 'Spot'},
        thumbFileName : String
    });


    clipSchema.methods.fileName = function() {

      var viddyName = this.videoSegmentId;

      viddyName = viddyName + "_" + this.index + "." + consts.videoFileFormatString(this.fileFormat);

      return viddyName;
    };

    clipSchema.methods.mergeTricks = function(newTricks, clip) {

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
      
      // lastly, we add this clip's thumbnail to the trickType obj if the clip only has one newTrick
      if (newTricks.length == 1) {
        console.log("about to update thumbnail");
        TrickType.findOne({_id: newTricks[0].trickTypeRef}, function (err, trickType) {
          console.log("find one tricktype " + trickType);
          if (!err) {
            console.log("adding thumbFileName: " + clip.thumbFileName);
            trickType.thumbFileName = clip.thumbFileName;

            trickType.save(function (err) {
              if (err) {
                console.log("error saving new thumb with trickType");
              }
            });
          }
        });
      }
    }

    mongoose.model("Clip", clipSchema);
};