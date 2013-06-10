var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = function() {
    
    var videoSchema = new Schema({
      title: 'string',
      url: 'string'
    });
    mongoose.model("Video", videoSchema);
};