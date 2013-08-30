var mongoose = require('mongoose'),
    troop = require('mongoose-troop');
var Schema = mongoose.Schema;

var User = mongoose.model("User");

module.exports = function() {

  var userEditSchema = new Schema({
    editInfo: Schema.Types.Mixed,
    editUser: {type: Schema.ObjectId, ref: 'User'}
	});

  userEditSchema.plugin(troop.timestamp, {useVirtual : false, createdPath : "created", modifiedPath : "updated"});

  mongoose.model("UserEdit", userEditSchema);
};