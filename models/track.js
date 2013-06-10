
var mongoose = require('mongoose');

var Schema = mongoose.Schema; // <-- EDIT: missing in the original post

module.exports = function() {
    
    var trackSchema = new Schema({
    	title: 'string', 
    	text: 'string'
    });
    mongoose.model("Track", trackSchema);
};