var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = mongoose.model("User");

module.exports = function() {

  var userEditSchema = new Schema({
    editInfo: Schema.Types.Mixed,
    editUser: {type: Schema.ObjectId, ref: 'User'}
	});

  mongoose.model("UserEdit", userEditSchema);
};