var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = mongoose.model("User");
var Tag = mongoose.model("Tag");
var UserEdit = mongoose.model("UserEdit");

module.exports = function() {

  var taggableObjectSchema = new Schema({
    score: {type: Number, default: 0},
    votes: [User.schema],
    tags: [Tag.schema],
    edits: [{ type: Schema.Types.ObjectId, ref: 'UserEdit' }]
	});

  mongoose.model("TaggableObject", taggableObjectSchema);
};


/* 

taggableObjectUpdate = {
  newVotes: [userRefs...],
  

}

*/