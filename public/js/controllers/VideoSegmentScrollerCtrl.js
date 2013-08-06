'use strict';

function VideoSegmentScrollerCtrl($scope, $http, YoutubeService) {


  $scope.testData = ["data1", "data2", "data3", "data4", "data5"];


  $scope.refreshVideoSegments = function() {
    $http.get('/api/videoSegments').
      success(function(data, status, headers, config) {
        $scope.videoSegments = data.videoSegments;
      });
  };

  $scope.playSegment = function(segment) {
    // cue the video if our console is ready to play videos
    if (YoutubeService.playerIsReady) {
      YoutubeService.cueSegment(segment);
    }
  }


  $scope.refreshVideoSegments();
}