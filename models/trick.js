var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");
var TrickType = mongoose.model("TrickType");

module.exports = function() {

  var trickSchema = TaggableObject.schema.extend({
		stance: Number,
		trickTypeRef: {type: Schema.ObjectId, ref: 'TrickType' },
		terrainType: {type : Number, default: 0},  // bitwise (ledge, flat, rail, stairs, transition)
    updated: { type: Date, default: Date.now }
	});

  trickSchema.methods.merge = function(trickObj) {
    this.stance = trickObj.stance;
    this.trickTypeRef = trickObj.trickTypeRef;
    this.terrainType = trickObj.terrainType;
  };

  mongoose.model("Trick", trickSchema);
};