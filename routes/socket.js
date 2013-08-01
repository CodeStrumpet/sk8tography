

// export function for listening to the socket
module.exports.init = function (socket) {

  socket.emit('sessionID', socket.id);

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
