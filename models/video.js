var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");

var consts = require('../public/js/SharedConstants').Constantsinople;

module.exports = function() {

    var videoSchema = TaggableObject.schema.extend({
      name: String,
      brandRef: Schema.Types.ObjectId,
      year: Number,
      infoUrl: String,
      purchaseUrl: String
    });

    videoSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

    mongoose.model("Video", videoSchema);
};