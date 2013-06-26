'use strict';


/* Controllers */


function AddVideoSegmentCtrl($scope, $http, $location, $routeParams, StringHelperService, $dialog) {

  // model
  $scope.newVideoSegment = {
    valid : false
  };

  $scope.parentVideo = {
    valid : false,
    name : ""
  };

  $scope.videos = {};

  $scope.additionalInfoVisible = false;

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

      // TODO move this into a service...

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
    
    $http.get('/api/videos', {}).
      success(function(data) {
        console.log("returned " + data.videos.length + " videos.");
        $scope.videos = {}; // reset videos

        var vidNames = [];
        for (var i = 0; i < data.videos.length; i++) {
          vidNames.push(data.videos[i].name);
          $scope.videos[data.videos[i].name] = data.videos[i]; // add the video to the videos object by name
        }
      callback(vidNames); 
    });
  };

  $scope.$on('typeahead-updated', function() {

    var selectedVideo = $scope.videos[$scope.parentVideo.name];

    if (selectedVideo) {

      console.log('Video selected '+ $scope.selectedVideo._id);  
      $scope.parentVideo.valid = true;
      $scope.newVideoSegment.videoRef = selectedVideo._id;      
    }    
  });

  $scope.addNewVideo = function() {

    $scope.opts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      title : "Add New Video",
      message: "Now is the time!",
      buttons: [{label:'Yes, I\'m sure', result: 'yes'},{label:'Nope', result: 'no'}],
      templateUrl: 'partials/addNewVideo',
      controller: 'AddNewVideoCtrl',
      dialogClass: 'modal modal-form',
      resolve: {
        dialogModel: function() {
          return $scope.parentVideo;            
        } 
      }
    };

    var d = $dialog.dialog($scope.opts);
    d.open().then(function(result){
      if(result) {
        if (result.video._id) {
          console.log('Video added '+ result.video._id);  
          $scope.parentVideo.valid = true;
          $scope.newVideoSegment.videoRef = result.video._id;    
        }
      }
    });
  };

  $scope.addNewVideoSegment = function() {
    
    console.log("adding url: " + $scope.newVideoSegment.url);

    console.log("one possible client-side VideoStatus value is: " + window.Constantsinople.VideoStatus.AVAILABLE);

    $http.post('/api/addVideoSegment', $scope.newVideoSegment).
      success(function(data) {
        if (data.error) {
          console.log("add videoSegment failed: " + data.error);
        } else {
          console.log("add videoSegment returned success.");  
        }
    });
  };
}


function AddNewVideoCtrl($scope, $http, dialog, dialogModel) {

  $scope.loading = false;

  console.log("resolve passed in: " + JSON.stringify(dialogModel));

  $scope.video = dialogModel;  // in case this is 'edit' instead of new... (note:  'parentVideo' was passed in through the dialogModel resolve...)

  console.log("video passed in: " + JSON.stringify($scope.parentVideo));

  $scope.submitNewVideo = function() {
    $scope.loading = true;

    $http.post('/api/addVideo', $scope.video).
      success(function(data) {
        if (data.error) {
          console.log("add video failed: " + data.error);
          dialog.close("Unable to add video");
        } else {
          console.log("add video returned success.");
          dialog.close(data);
        }
    });
  };

   $scope.close = function(result) {
      dialog.close(result);
    };
}


function VideoSegmentsCtrl($scope, $http, SocketConnection) {

  // socket listeners
  SocketConnection.on('init', function (data) {
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

function IndexCtrl($scope, $http, SocketConnection) {

  // socket listeners
  SocketConnection.on('init', function (data) {
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
