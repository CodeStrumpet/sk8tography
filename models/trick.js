var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrickType = mongoose.model("TrickType");

module.exports = function() {

  var trickSchema = new Schema({
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