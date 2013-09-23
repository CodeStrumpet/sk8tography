var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");
var Clip = mongoose.model("Clip");
var Song = mongoose.model("Song");

module.exports = function() {

  var playlistSchema = TaggableObject.schema.extend({
    title: String,
    clips: [{type: Schema.ObjectId, ref: 'Clip' }],
    song: {type: Schema.ObjectId, ref: 'Song' }
  });

  playlistSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  mongoose.model("Playlist", playlistSchema);
};