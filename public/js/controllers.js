'use strict';




/* Controllers */


function AddVideoCtrl($scope, $http, socket) {
  console.log("looking at add video");

  // socket listeners
  socket.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });

  $scope.video = {};

  $scope.addNewVideo = function() {
    console.log("adding url: " + $scope.video.url);

    socket.emit('send:message', {
      msg : "this is the message from the client"
    }, function (result) {
      console.log("result callback");
      if (!result) {
        console.log('There was an error messaging the server');
      } else {
        console.log("successfully sent message to the server");
      }
    });
  };

}



// =========================================================
// =========================================================

function IndexCtrl($scope, $http) {
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
