

var models = ['./track.js', './video.js', './skater.js', './trickType.js', 
	'./trick.js', './clip.js'];

exports.initialize = function() {
    var l = models.length;
    for (var i = 0; i < l; i++) {
        require(models[i])();
    }
};

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/test1');

