var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var TaggableObject = mongoose.model("TaggableObject");

var cache = require('../routes/cache');

var activeTrickTypesKey = "activeTrickTypes";

module.exports = function() {

  var trickTypeSchema = TaggableObject.schema.extend({
		name: String,
		otherNames: [String],
		categories: {type: Number, default: 0},     // bitwise (flip-trick, rotation, stall, …)
    thumbFileName: String,
    nameSlug: String,
    infoUrls: [String]
	});

  trickTypeSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});


  // generate name slug upon every save (lowercase string with spaces replaced by dashes)
  trickTypeSchema.pre('save', function (next) {

    if (this.name) {
      this.name = this.name.toTitleCase();
    }

    if (this.name) {
      this.nameSlug = this.name.replace(/\s+/g, '-').toLowerCase();
    }
    next();
  });

  // mark the activeTrickTypes cache item dirty
  trickTypeSchema.post('save', function (doc) {
    cache.markDirty(activeTrickTypesKey);
  });


  trickTypeSchema.statics.activeTrickTypes = function (callbackFn) {

    var cacheResult = cache.lookup(activeTrickTypesKey);

    // short circuit and simply return result if it's already in the cache
    if (cacheResult) {
      console.log("cache hit for activeTrickTypes");
      callbackFn(null, cacheResult);
      return;
    }


    var TrickTypeModel = this; // have to create a reference to 'this' so we don't lose it in the async sub function due to js scoping...

    var async = require('async');

    async.parallel({

      trickTypeRefs : function(callback) {
        var Clip = mongoose.model("Clip");
        Clip.find().distinct("tricks.trickTypeRef", function(error, trickTypeRefs) {
          if (error) {
            callback(error);
          } else {
            callback(null, trickTypeRefs);
          }
        });
      }, 
      trickTypes : function(callback) {
        var query = TrickTypeModel.find(); // pass in the TrickTypeModel due to functional scoping...
        query.select = "name thumbFileName nameSlug";
        query.sort({name : 1});
        query.exec(function(error, trickTypes) {
          if (error) {
            callback(error);
          } else {
            callback(null, trickTypes);
          }
        });
      }
    },

    // Process the results from our parallel functions above
    function(err, results) {

      if (err) {

        callbackFn(err);

      } else {

        // Filter trickTypes to items that have a matching ref...
        var matchingTTypes = [];
        for(var i = 0; i<results.trickTypeRefs.length; i++) {

          var matches = results.trickTypes.filter(function(tType) {
            if (tType._id.equals(results.trickTypeRefs[i])) {
              return tType;
            } else {
              return null;
            }
          });

          if (matches.length > 0) {
            matchingTTypes.push.apply(matchingTTypes, matches); // add all matches (should only be one) to the matchingTTypes array
          }
        }
        // save the result in the cache
        cache.store(activeTrickTypesKey, matchingTTypes);

        // return result through callback function
        callbackFn(null, matchingTTypes);
      }
    });    
  };


  mongoose.model("TrickType", trickTypeSchema);
};