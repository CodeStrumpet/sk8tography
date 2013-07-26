var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var trickTypeSchema = new Schema({
		name: String,
		otherNames: [String],
		categories: {type: Number, default: 0},     // bitwise (flip-trick, rotation, stall, …)
        thumbFileName: String
	});

  mongoose.model("TrickType", trickTypeSchema);
};