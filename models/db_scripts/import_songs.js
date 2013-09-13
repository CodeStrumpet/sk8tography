
exports.importSongs = function() {

  var mongoose = require('mongoose');
  var Song = mongoose.model("Song");

  var tracks = require('../../audio/free_tracks');

  for (var i = 0; i < tracks.length; i++) {
    console.log("trackName: " + tracks[i].name);

    var newSong = new Song({
      name: tracks[i].name,
      fileNameOGG: tracks[i].fileNameOGG,
      fileNameMP3: tracks[i].fileNameMP3,
      artist: tracks[i].artist
    });

    newSong.save(function (saveErr) {
      if (saveErr) {
        console.log("saveErr: " + saveErr);              
      }
    }); 
  }
};

