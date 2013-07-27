

var models = ['./track.js', './user.js', './video.js', './brand.js', './videoSegment.js', './skater.js', './trickType.js', 
	'./trick.js', './spot.js', './clip.js'];

exports.initialize = function() {
    var l = models.length;
    for (var i = 0; i < l; i++) {
        require(models[i])();
    }
};

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/test3');

