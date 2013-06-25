'use strict';


/* Controllers */


function AddVideoSegmentCtrl($scope, $http, $location, $routeParams, socket, StringHelperService) {

  // model
  $scope.newVideoSegment = {
    valid : false
  };

  $scope.parentVideo = {
    valid : false,
    name : ""
  };

  $scope.additionalInfoVisible = false;

  // socket listeners
  socket.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });

  $http.get('/api/videoSegments').
    success(function(data, status, headers, config) {
      $scope.videoSegments = data.videoSegments;
  });

  $scope.additionalInfoLabelText = function() {
    return $scope.additionalInfoVisible ? "\u25BC" : "\u25B6";
  };

  $scope.showAddParentVideoButton = function() {
    return (!$scope.parentVideo.valid) && $scope.parentVideo.name.length > 2;
  };

  $scope.segmentUrlUpdated = function() {
    $scope.newVideoSegment.valid = false;
    if ($scope.newVideoSegment.url && $scope.newVideoSegment.url.indexOf("youtube.com/watch?v") != -1) {
      var params = StringHelperService.urlParams($scope.newVideoSegment.url);
      if (params['v']) {
        var infoURL = "http://gdata.youtube.com/feeds/api/videos/" + params['v'] + "?v=2&alt=jsonc";
        $http({
          url: infoURL,
          method: "GET"
        }).success(function(videoInfo, status, headers, config) {

          console.log("video info: " + JSON.stringify(videoInfo));

          $scope.newVideoSegment.valid = true;

          $scope.newVideoSegment.sourceTitle = videoInfo.data.title;
          $scope.newVideoSegment.sourceDesc = videoInfo.data.description;
          $scope.newVideoSegment.sourceSquareThumb = videoInfo.data.thumbnail.sqDefault;
          $scope.newVideoSegment.sourceLargeThumb = videoInfo.data.thumbnail.hqDefault;
          $scope.newVideoSegment.sourceDuration = videoInfo.data.duration;
          $scope.newVideoSegment.sourceViewCount = videoInfo.data.viewCount;
          $scope.newVideoSegment.sourceUploader = videoInfo.data.uploader;

        }).error(function(data, status, headers, config) {
          console.log("video info request failed: " + status);
        });
      }
    }    
  };

  $scope.parentVideoTypeaheadFn = function(query, callback) {

    //callback(["value1", "value2"]);
    
    $http.get('/api/videos', {}).
      success(function(data) {
        console.log("returned " + data.videos.length + " videos.");
        var vidNames = [];
        for (var i = 0; i < data.videos.length; i++) {
          vidNames.push(data.videos[i].name);
        }
      callback(vidNames); 
    });
  };

 

  $scope.addNewVideoSegment = function() {
    
    console.log("adding url: " + $scope.newVideoSegment.url);

    console.log("one possible client-side VideoStatus value is: " + window.Constantsinople.VideoStatus.AVAILABLE);

    $http.put('/api/addVideoSegment', $scope.newVideoSegment).
      success(function(data) {
        if (data.error) {
          console.log("add videoSegment failed: " + data.error);
        } else {
          console.log("add videoSegment returned success: " + JSON.stringify(data));  
        }
    });
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
