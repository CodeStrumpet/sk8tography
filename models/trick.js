var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrickType = mongoose.model("TrickType");

module.exports = function() {

  var trickSchema = new Schema({
		stance: Number,
		trickTypeRef: Schema.ObjectId,
		terrainType: {type : Number, default: 0}  // bitwise (ledge, flat, rail, stairs, transition)
	});

  trickSchema.methods.merge = function(trickObj) {
    this.stance = trickObj.stance;
    this.trickTypeRef = trickObj.trickTypeRef;
    this.terrainType = trickObj.terrainType;
  };

  mongoose.model("Trick", trickSchema);
};