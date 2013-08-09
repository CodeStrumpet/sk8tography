var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = mongoose.model("User");

module.exports = function() {

  var feedbackSchema = new Schema({
    text : String,
    type : String,
    username : String,
    userRef : {type: Schema.ObjectId, ref: 'User' },
    updated: { type: Date, default: Date.now }
  });

  mongoose.model("Feedback", feedbackSchema);
};