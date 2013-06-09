
var videoService = (function () {

  console.log("initing video service");

  var addVideo = function (videoURL) {
    console.log("adding video with url: " + videoURL);

    var childProcess = require('child_process'),
     
     ls;

     ls = childProcess.exec("youtube-dl -o videos/file.mp4 'http://www.youtube.com/watch?v=u5aLtRr3_38'", function (error, stdout, stderr) {
       if (error) {
         console.log(error.stack);
         console.log('Error code: '+error.code);
         console.log('Signal received: '+error.signal);
       }
       console.log('Child Process STDOUT: '+stdout);
       console.log('Child Process STDERR: '+stderr);
     });

     ls.on('exit', function (code) {
       console.log('Child process exited with exit code '+code);
     });

  };

  return {
      addVideo: addVideo
  };

}());


// export function for listening to the socket
module.exports = function (socket) {

  // send the new user their name and a list of users
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
