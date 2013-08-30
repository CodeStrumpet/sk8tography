var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");

module.exports = function() {

  var skaterSchema = TaggableObject.schema.extend({
    name : String,
    isGoofy : Boolean,
    thumbFileName: String,
    nameSlug: String
  });

  skaterSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  // generate name slug upon every save (lowercase string with spaces replaced by dashes)
  skaterSchema.pre('save', function (next) {

    if (this.name) {
      this.nameSlug = this.name.replace(/\s+/g, '-').toLowerCase();
    }
    next();
  });

  mongoose.model("Skater", skaterSchema);
};