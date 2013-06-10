
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = function() {
    
    var trackSchema = new Schema({
      title: 'string', 
      text: 'string'
    });
    mongoose.model("Track", trackSchema);
};