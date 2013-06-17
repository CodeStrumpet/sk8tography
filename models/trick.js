var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrickType = mongoose.model("TrickType");

module.exports = function() {

  var trickSchema = new Schema({
		stance: Number,
		trickType: [TrickType],
		featureType: {type : Number, default: 0}  // bitwise (ledge, flat, rail, stairs, transition)
	});

  mongoose.model("Trick", trickSchema);
};