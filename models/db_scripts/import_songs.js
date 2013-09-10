
exports.importSongs = function() {

  var mongoose = require('mongoose');
  var Song = mongoose.model("Song");

  var tracks = require('../../audio/free_tracks');

  for (var i = 0; i < tracks.length; i++) {
    console.log("trackName: " + tracks[i].name);

    var newSong = new Song({
      name: tracks[i].name,
      fileName: tracks[i].fileName,
      artist: tracks[i].artist
    });

    newSong.save(function (saveErr) {
      if (saveErr) {
        console.log("saveErr: " + saveErr);              
      }
    }); 
  }
};

