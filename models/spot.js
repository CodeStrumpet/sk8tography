var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var spotSchema = new Schema({
		name : String,
		otherNames : [String],
		latitude : Number,
		longitude : Number,
		address : String, 	// TODO: should probably be structured…
		features : Number, 	// bitwise (ledge, flat, rail, stairs)
    updated: { type: Date, default: Date.now }
	});

  mongoose.model("Spot", spotSchema);
};