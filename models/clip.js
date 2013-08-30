var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');

var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");
var Trick = mongoose.model("Trick");
var Skater = mongoose.model("Skater");
var TrickType = mongoose.model("TrickType");

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {
    
    var clipSchema = TaggableObject.schema.extend({
        videoSegmentId: String,
        index: Number,        
        status: { type: Number, default: consts.ClipStatus.ADDED },
        fileFormat: Number,
        startTime: Number,
        duration: Number,
        tricks : [Trick.schema],
        skaterRef : {type: Schema.ObjectId, ref: 'Skater' },
        spotRef : {type: Schema.ObjectId, ref: 'Spot'},
        thumbFileName : String
    });

    clipSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});


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

      // lastly, we add this clip's thumbnail to any trickTypes that don't already have one...
      for (var i = 0; i < this.tricks.length; i++) {
        TrickType.findOne({_id: this.tricks[i].trickTypeRef}, function (err, trickType) {          
          if (!err) {            
            // if the trickType doesn't already have a thumbFileName, use the current clip's thumbFileName
            if (!trickType.thumbFileName || trickType.thumbFileName == "") {
              trickType.thumbFileName = clip.thumbFileName;
              trickType.save(function (err) {
                if (err) {
                  console.log("error saving new thumb with trickType");
                }
              });
            }
          }
        });
      }
    }

    mongoose.model("Clip", clipSchema);
};