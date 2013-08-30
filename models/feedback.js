var mongoose = require('mongoose'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var User = mongoose.model("User");

module.exports = function() {

  var feedbackSchema = new Schema({
    text : String,
    type : String,
    username : String,
    userRef : {type: Schema.ObjectId, ref: 'User' }
  });

  feedbackSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  mongoose.model("Feedback", feedbackSchema);
};