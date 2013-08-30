var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");

module.exports = function() {

  var spotSchema = TaggableObject.schema.extend({
		name : String,
		otherNames : [String],
		latitude : Number,
		longitude : Number,
		address : String, 	// TODO: should probably be structured…
		features : Number 	// bitwise (ledge, flat, rail, stairs)
	});

  spotSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  mongoose.model("Spot", spotSchema);
};