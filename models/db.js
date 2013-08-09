
var nconf = require('nconf');

var models = ['./track.js', './user.js', './video.js', './brand.js', './videoSegment.js', './skater.js', './trickType.js', 
	'./trick.js', './spot.js', './clip.js'];

exports.initialize = function() {
    var l = models.length;
    for (var i = 0; i < l; i++) {
        require(models[i])();
    }
};



// figure out what db to use
var dbURI = "";
if (nconf.get('local_db')) {

  dbURI = 'mongodb://localhost/' + nconf.get('local_db');
  console.log("using local db: " + dbURI);

} else if (nconf.get('NODE_ENV') == 'production') {

  dbURI = nconf.get('MONGOLAB_URI_PRODUCTION');
  console.log("using PRODUCTION db...");

} else {

  dbURI = nconf.get('MONGOLAB_URI_DEVELOPMENT');
  console.log("using DEVELOPMENT db...");

}

// handle the case where there is no .env file
if (!dbURI) {
  dbURI = 'mongodb://localhost/' + "sk8abase_test";
  console.log("No db specified!! Using local db: " + dbURI);
}


var mongoose = require('mongoose');
mongoose.connect(dbURI);



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