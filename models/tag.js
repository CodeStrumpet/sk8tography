var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = mongoose.model("User");

module.exports = function() {

  var tagSchema = new Schema({
    tagText: String,
    tagUser: {type: Schema.ObjectId, ref: 'User'},
    score: {type: Number, default: 0},
    votes: [User.schema]    
  });

  mongoose.model("Tag", tagSchema);
};