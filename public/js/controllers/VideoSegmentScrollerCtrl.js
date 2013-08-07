'use strict';

function VideoSegmentScrollerCtrl($scope, $http, YoutubeService) {


  $scope.testData = ["data1", "data2", "data3", "data4", "data5"];

  $scope.$on( 'YoutubeService.timeUpdated', function( event, newTime ) {
    $scope.$apply(function () {
      $scope.segmentInfo.currentTime = newTime;
    });
  });


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

    $scope.segmentInfo = {
      duration: segment.sourceDuration,
      scale : 40.0,
      currentTime : 0.0
    };

    var clipsUrl = '/api/clips' + "?segmentId=" + segment._id;
    $http.get(clipsUrl).
      success(function(data, status, headers, config) {
        $scope.segmentInfo.clips = data.clips;
        console.log("numClips: " + data.clips.length);
    });
  }

  $scope.scrollFunction = function(arg) {
    console.log("scroll function called  " + arg);
  }


  $scope.refreshVideoSegments();
}