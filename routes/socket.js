
var videoService = (function () {

  console.log("initing video service");

  var addVideo = function (videoURL) {
    console.log("adding video with url: " + videoURL);
     
    var spawn = require('child_process').spawn,
    youtubedl = spawn( "youtube-dl", ["-o", "videos/file.mp4", "http://www.youtube.com/watch?v=u5aLtRr3_38"]);

    youtubedl.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    youtubedl.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

  };

  return {
      addVideo: addVideo
  };

}());


exports.initialize = function() {
    var l = models.length;
    for (var i = 0; i < l; i++) {
        require(models[i])();
    }
};


// export function for listening to the socket
module.exports = function (socket) {

  socket.emit('init', {
    msg: 'socket inited on server'
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('test:broadcast', {
    msg : 'contents of test...'
  });

  // received message from client
  socket.on('send:message', function (data) {
    console.log("message from client: " + JSON.stringify(data));
    socket.emit('send:message_Result', {
      status : "success"
    });
  });

  socket.on('addVideo', function (data) {

    videoService.addVideo(data.url);

  });



  // clean up when we are finished with an individual connection
  socket.on('disconnect', function () {
    // TODO cleanup
  });
};
