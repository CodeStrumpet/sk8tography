var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");

module.exports = function() {

  var songSchema = TaggableObject.schema.extend({
    name: String,
    artist: String,
    fileNameOGG: String,
    fileNameMP3: String
	});

  songSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  mongoose.model("Song", songSchema);
};