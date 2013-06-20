'use strict';


/* Controllers */


function AddVideoSegmentCtrl($scope, $http, $location, $routeParams, socket) {
  console.log("looking at add videoSegment");

  // socket listeners
  socket.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });

  $scope.videoSegment = {};

  $scope.addNewVideoSegment = function() {
    
    console.log("adding url: " + $scope.videoSegment.url);

    console.log("one possible client-side VideoStatus value is: " + window.Constantsinople.VideoStatus.AVAILABLE);

    $http.put('/api/addVideoSegment', $scope.videoSegment).
      success(function(data) {
        if (data.error) {
          console.log("add videoSegment failed: " + data.error);
        } else {
          console.log("add videoSegment returned success: " + JSON.stringify(data));  
        }
    });


/*
    socket.emit("addVideo", {
      url : $scope.video.url
    });
    
    // testing message sending...
    socket.emit('send:message', {
      msg : "this is the message from the client"
    }, function (result) {
      if (!result) {
        console.log('There was an error messaging the server');
      } else {
        console.log("successfully sent message to the server");
      }
    });
*/
  };


}


function VideoSegmentsCtrl($scope, $http, socket) {

  // socket listeners
  socket.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });

  $http.get('/api/videoSegments').
    success(function(data, status, headers, config) {
      $scope.videoSegments = data.videoSegments;
    });

  $scope.processVideoSegment = function(index) {
    var videoSegment = $scope.videoSegments[index];

    $http.put('/api/processVideoSegment', {videoSegmentId : videoSegment._id}).
      success(function(data) {
        if (data.error) {
          console.log("process videoSegment failed: " + data.error);
        } else {
          console.log("process videoSegment returned success: " + JSON.stringify(data));  
        }
    });
  };
}


// =========================================================
// =========================================================

function IndexCtrl($scope, $http, socket) {

  // socket listeners
  socket.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });

  $http.get('/api/posts').
    success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
}

function AddPostCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.submitPost = function () {
    $http.post('/api/post', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
  $scope.addImage = function () {
  };
}

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.form = data.post;
    });

  $scope.editPost = function () {
    $http.put('/api/post/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readPost/' + $routeParams.id);
      });
  };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });

  $scope.deletePost = function () {
    $http.delete('/api/post/' + $routeParams.id).
      success(function(data) {
        $location.url('/');
      });
  };

  $scope.home = function () {
    $location.url('/');
  };
}
