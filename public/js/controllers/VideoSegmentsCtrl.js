'use strict';

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