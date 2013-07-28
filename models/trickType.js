var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var trickTypeSchema = new Schema({
		name: String,
		otherNames: [String],
		categories: {type: Number, default: 0},     // bitwise (flip-trick, rotation, stall, …)
    thumbFileName: String,
    nameSlug: String
	});


  // generate name slug upon every save (lowercase string with spaces replaced by dashes)
  trickTypeSchema.pre('save', function (next) {

    if (this.name) {
      this.nameSlug = this.name.replace(/\s+/g, '-').toLowerCase();
    }
    next();
  });

  mongoose.model("TrickType", trickTypeSchema);
};