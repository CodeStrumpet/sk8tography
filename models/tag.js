var mongoose = require('mongoose'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var User = mongoose.model("User");

module.exports = function() {

  var tagSchema = new Schema({
    tagText: String,
    tagUser: {type: Schema.ObjectId, ref: 'User'},
    score: {type: Number, default: 0},
    votes: [User.schema]    
  });

  tagSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  mongoose.model("Tag", tagSchema);
};