var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var skaterSchema = new Schema({
    name : String,
    isGoofy : Boolean,
    thumbFileName: String,
    nameSlug: String
  });

  // generate name slug upon every save (lowercase string with spaces replaced by dashes)
  skaterSchema.pre('save', function (next) {

    if (this.name) {
      this.nameSlug = this.name.replace(/\s+/g, '-').toLowerCase();
    }
    next();
  });

  mongoose.model("Skater", skaterSchema);
};