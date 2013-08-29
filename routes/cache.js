var mongoose = require('mongoose');
var Track = mongoose.model("Track");
var VideoSegment = mongoose.model("VideoSegment");
var Clip = mongoose.model("Clip");
var Video = mongoose.model("Video");
var Skater = mongoose.model("Skater");
var User = mongoose.model("User");
var TrickType = mongoose.model("TrickType");
var Feedback = mongoose.model("Feedback");
var Trick = mongoose.model("Trick");
var constantsPath = '../public/js/SharedConstants';
var consts = require(constantsPath).Constantsinople;


var dirtyPaths = {}; // this will be used to register db collections that have been updated...
var cache = {};

exports.activeTrickTypes = function(callbackFn) {

  var cacheKey = "activeTrickTypes";

  if (dirtyPaths["trickType"] || !cache[cacheKey]) { 
    // refresh results because they don't exist or they were dirty

    var async = require('async');

    async.parallel({

      trickTypeRefs : function(callback) {
        Clip.find().distinct("tricks.trickTypeRef", function(error, trickTypeRefs) {
          if (error) {
            callback(error);
          } else {
            callback(null, trickTypeRefs);
          }
        });
      }, 
      trickTypes : function(callback) {
        var query = TrickType.find();
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

        callbackFn(null, matchingTTypes);
      }
    });

    /*
    Clip.find().distinct("tricks.trickTypeRef", function(error, trickTypeRefs) {
      if (error) {
        callbackFn(error, null);
      } else {      
        var query = TrickType.find();
        query.select = "name thumbFileName nameSlug";
        query.sort({name : 1});

        query.exec(function(err, trickTypes) {
          if (err) {
            callbackFn(err, null);
          } else {
            var matchingTTypes = [];

            for(var i = 0; i<trickTypeRefs.length; i++) {
              var matches = trickTypes.filter(function(tType) {
                if (tType._id.equals(trickTypeRefs[i])) {
                  console.log("match!");
                  return tType;
                } else {
                  return null;
                }
              });

              if (matches.length > 0) {
                matchingTTypes.push(matches[0]); // ?? should we be pushing all matches here??
              }
            }
            callbackFn(null, matchingTTypes);
          }
        });
      }
    });
    */
  } else {
    console.log("returning cache result for: " + cacheKey);
    callbackFn(null, cache[cacheKey]);
  }
};