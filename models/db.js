

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



/*
// startup script, save all skaters and trickTypes to generate name slugs
// delay by 2 seconds until mongo connection is useable
setInterval(function() {

  var Skater = mongoose.model("Skater");
  var TrickType = mongoose.model("TrickType");
  var models = [Skater, TrickType];

  for (var j = 0; j < models.length; j++) {
    var query = models[j].find();

    query.exec(function(err, results) {
      for (var i = 0; i < results.length; i++) {
        results[i].save(function(err) {
          if (err) {
            console.log("error saving entity" + err);
          }
        });
      }
    });
  }

}, 2000);
*/